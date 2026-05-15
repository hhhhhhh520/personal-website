#!/usr/bin/env python3
"""
Text Chunker Module

This module implements chunking strategies for RAG content.
Different strategies for different content types:
    - Markdown: Split by headers/sections
    - Plain text: Sliding window with overlap
    - JSON/Structured: Split by logical units

Usage:
    from chunker import TextChunker
    chunker = TextChunker(chunk_size=400, overlap=50)
    chunks = chunker.chunk_text(text, metadata)
"""

import re
import json
from dataclasses import dataclass, field, asdict
from typing import List, Dict, Any, Optional
from pathlib import Path


@dataclass
class Chunk:
    """Represents a single text chunk with metadata."""
    id: str
    content: str
    source: str
    source_id: str
    title: str
    metadata: Dict[str, Any] = field(default_factory=dict)
    chunk_index: int = 0
    total_chunks: int = 1
    char_count: int = 0

    def __post_init__(self):
        self.char_count = len(self.content)

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class TextChunker:
    """
    Text chunker with multiple strategies.

    Strategies:
    - sliding: Sliding window with overlap (default)
    - markdown: Split by Markdown headers
    - semantic: Split by semantic boundaries (paragraphs, sentences)
    """

    def __init__(self, chunk_size: int = 400, overlap: int = 50):
        """
        Initialize the chunker.

        Args:
            chunk_size: Target size for each chunk in characters
            overlap: Number of characters to overlap between chunks
        """
        self.chunk_size = chunk_size
        self.overlap = overlap

    def chunk_text(self, text: str, metadata: Dict[str, Any]) -> List[Chunk]:
        """
        Split text into chunks using sliding window strategy.
        Maintains semantic completeness by preferring natural break points.

        Args:
            text: The text to chunk
            metadata: Metadata from the source document

        Returns:
            List of Chunk objects
        """
        if not text or len(text.strip()) == 0:
            return []

        # For short texts, return as single chunk
        if len(text) <= self.chunk_size:
            return [self._create_chunk(
                text,
                metadata,
                chunk_index=0,
                total_chunks=1
            )]

        chunks = []
        start = 0
        chunk_index = 0

        while start < len(text):
            # Calculate end position
            end = start + self.chunk_size

            # If not at the end, try to find a natural break point
            if end < len(text):
                # Look for sentence boundaries within a window
                break_window = 50  # Look back up to 50 chars for a break
                search_start = max(start, end - break_window)
                search_text = text[search_start:end]

                # Find preferred break points (sentence endings)
                break_points = [
                    search_text.rfind('\n\n'),  # Paragraph break
                    search_text.rfind('\n'),    # Line break
                    search_text.rfind('。'),    # Chinese period
                    search_text.rfind('；'),    # Chinese semicolon
                    search_text.rfind('.'),     # English period
                    search_text.rfind(';'),     # English semicolon
                ]

                # Use the best break point found
                best_break = max(break_points)
                if best_break > 0:
                    end = search_start + best_break + 1

            # Extract chunk content
            chunk_content = text[start:end].strip()

            if chunk_content:
                chunks.append(self._create_chunk(
                    chunk_content,
                    metadata,
                    chunk_index=chunk_index,
                    total_chunks=0  # Will be updated later
                ))
                chunk_index += 1

            # Move to next chunk with overlap
            start = end - self.overlap if end < len(text) else len(text)

        # Update total_chunks for all chunks
        total = len(chunks)
        for chunk in chunks:
            chunk.total_chunks = total

        return chunks

    def chunk_markdown(self, text: str, metadata: Dict[str, Any]) -> List[Chunk]:
        """
        Split Markdown text by headers/sections.
        Preserves document structure and section context.

        Args:
            text: Markdown text to chunk
            metadata: Metadata from the source document

        Returns:
            List of Chunk objects
        """
        if not text or len(text.strip()) == 0:
            return []

        # Split by headers (## or ###)
        header_pattern = r'\n(?=#{1,3}\s)'
        sections = re.split(header_pattern, text)

        chunks = []
        chunk_index = 0

        for section in sections:
            section = section.strip()
            if not section:
                continue

            # If section is too long, use sliding window
            if len(section) > self.chunk_size * 1.5:
                sub_chunks = self.chunk_text(section, metadata)
                for sub_chunk in sub_chunks:
                    # Add section header info to metadata
                    header_match = re.match(r'^(#{1,3})\s+(.+)', section)
                    if header_match:
                        level = len(header_match.group(1))
                        header_text = header_match.group(2)
                        sub_chunk.metadata['section_header'] = header_text
                        sub_chunk.metadata['section_level'] = level

                    sub_chunk.chunk_index = chunk_index
                    chunks.append(sub_chunk)
                    chunk_index += 1
            else:
                chunk = self._create_chunk(
                    section,
                    metadata,
                    chunk_index=chunk_index,
                    total_chunks=0
                )

                # Extract header info
                header_match = re.match(r'^(#{1,3})\s+(.+)', section)
                if header_match:
                    level = len(header_match.group(1))
                    header_text = header_match.group(2)
                    chunk.metadata['section_header'] = header_text
                    chunk.metadata['section_level'] = level

                chunks.append(chunk)
                chunk_index += 1

        # Update total_chunks
        total = len(chunks)
        for chunk in chunks:
            chunk.total_chunks = total

        return chunks

    def chunk_structured_content(
        self,
        content: str,
        metadata: Dict[str, Any],
        content_type: str = "text"
    ) -> List[Chunk]:
        """
        Chunk content based on its type.

        Args:
            content: The content to chunk
            metadata: Metadata from the source
            content_type: Type of content (text, markdown, json)

        Returns:
            List of Chunk objects
        """
        if content_type == "markdown":
            return self.chunk_markdown(content, metadata)
        else:
            return self.chunk_text(content, metadata)

    def _create_chunk(
        self,
        content: str,
        metadata: Dict[str, Any],
        chunk_index: int,
        total_chunks: int
    ) -> Chunk:
        """
        Create a Chunk object with proper metadata.

        Args:
            content: Chunk content
            metadata: Source metadata
            chunk_index: Index of this chunk
            total_chunks: Total number of chunks

        Returns:
            Chunk object
        """
        # Generate unique ID
        source_id = metadata.get('source_id', 'unknown')
        chunk_id = f"{source_id}_{chunk_index}"

        return Chunk(
            id=chunk_id,
            content=content,
            source=metadata.get('source', 'unknown'),
            source_id=source_id,
            title=metadata.get('title', ''),
            metadata={
                'original_metadata': metadata,
                'chunk_type': 'text',
            },
            chunk_index=chunk_index,
            total_chunks=total_chunks
        )


class DocumentChunker:
    """
    High-level chunker that processes extracted documents.
    """

    def __init__(self, chunk_size: int = 400, overlap: int = 50):
        self.text_chunker = TextChunker(chunk_size, overlap)

    def process_documents(self, documents: List[Dict[str, Any]]) -> List[Chunk]:
        """
        Process a list of extracted documents into chunks.

        Args:
            documents: List of document dictionaries from extract_data.py

        Returns:
            List of all chunks from all documents
        """
        all_chunks = []

        for doc in documents:
            content = doc.get('content', '')
            metadata = doc.get('metadata', {})

            # Add source info to metadata
            metadata['source'] = doc.get('source', 'unknown')
            metadata['source_id'] = doc.get('source_id', 'unknown')
            metadata['title'] = doc.get('title', '')
            metadata['doc_id'] = doc.get('id', '')

            # Determine content type
            content_type = 'text'
            if metadata.get('type') == 'mdx':
                content_type = 'markdown'

            # Chunk the content
            chunks = self.text_chunker.chunk_structured_content(
                content,
                metadata,
                content_type
            )

            all_chunks.extend(chunks)

        return all_chunks


def main():
    """Test the chunker with sample data."""
    import json
    from pathlib import Path

    # Load extracted content
    data_path = Path(__file__).parent.parent / 'data' / 'extracted_content.json'

    if data_path.exists():
        with open(data_path, 'r', encoding='utf-8') as f:
            documents = json.load(f)

        chunker = DocumentChunker(chunk_size=400, overlap=50)
        chunks = chunker.process_documents(documents)

        print(f"Processed {len(documents)} documents into {len(chunks)} chunks")

        # Show sample chunks
        for chunk in chunks[:3]:
            print(f"\n--- Chunk {chunk.id} ---")
            print(f"Source: {chunk.source}/{chunk.source_id}")
            print(f"Title: {chunk.title}")
            print(f"Content preview: {chunk.content[:100]}...")
            print(f"Char count: {chunk.char_count}")
    else:
        print(f"Data file not found: {data_path}")


if __name__ == "__main__":
    main()