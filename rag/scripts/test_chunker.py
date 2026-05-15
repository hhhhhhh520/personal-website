#!/usr/bin/env python3
"""
Tests for TextChunker module.

Tests cover:
- Sliding window chunking
- Natural break point detection
- Markdown chunking strategy
- Edge cases (empty, long, special chars)
"""

import pytest
import sys
from pathlib import Path

# Add scripts directory to path
sys.path.insert(0, str(Path(__file__).parent))

from chunker import TextChunker, Chunk, DocumentChunker


class TestTextChunker:
    """Tests for TextChunker class."""

    def test_init_default_params(self):
        """Test default initialization."""
        chunker = TextChunker()
        assert chunker.chunk_size == 400
        assert chunker.overlap == 50

    def test_init_custom_params(self):
        """Test custom initialization."""
        chunker = TextChunker(chunk_size=200, overlap=30)
        assert chunker.chunk_size == 200
        assert chunker.overlap == 30

    def test_chunk_empty_text(self):
        """Test chunking empty text."""
        chunker = TextChunker()
        result = chunker.chunk_text("", {})
        assert result == []

    def test_chunk_whitespace_only(self):
        """Test chunking whitespace-only text."""
        chunker = TextChunker()
        result = chunker.chunk_text("   \n\n  \t  ", {})
        assert result == []

    def test_chunk_short_text_single_chunk(self):
        """Test short text returns single chunk."""
        chunker = TextChunker(chunk_size=100, overlap=20)
        text = "This is a short text."
        result = chunker.chunk_text(text, {'source': 'test'})

        assert len(result) == 1
        assert result[0].content == text
        assert result[0].chunk_index == 0
        assert result[0].total_chunks == 1

    def test_chunk_exact_size_text(self):
        """Test text exactly at chunk size."""
        chunker = TextChunker(chunk_size=100, overlap=20)
        text = "a" * 100
        result = chunker.chunk_text(text, {'source': 'test'})

        assert len(result) == 1
        assert len(result[0].content) == 100

    def test_chunk_long_text_multiple_chunks(self):
        """Test long text produces multiple chunks."""
        chunker = TextChunker(chunk_size=100, overlap=20)
        text = "This is a sentence. " * 20  # ~440 chars
        result = chunker.chunk_text(text, {'source': 'test'})

        assert len(result) > 1
        # Verify chunk indices
        for i, chunk in enumerate(result):
            assert chunk.chunk_index == i
            assert chunk.total_chunks == len(result)

    def test_chunk_preserves_content(self):
        """Test that chunking preserves all content."""
        chunker = TextChunker(chunk_size=50, overlap=10)
        text = "abcdefghijklmnopqrstuvwxyz"
        result = chunker.chunk_text(text, {'source': 'test'})

        # Reconstruct content from chunks (accounting for overlap)
        all_content = "".join(c.content for c in result)
        # Due to overlap, content may be duplicated but all chars should be present
        for char in text:
            assert char in all_content

    def test_natural_break_paragraph(self):
        """Test breaking at paragraph boundaries."""
        chunker = TextChunker(chunk_size=100, overlap=20)
        text = "First paragraph here.\n\nSecond paragraph here.\n\nThird paragraph."
        result = chunker.chunk_text(text, {'source': 'test'})

        # Should prefer paragraph breaks
        assert len(result) >= 1
        for chunk in result:
            assert chunk.content.strip() != ""

    def test_natural_break_chinese_period(self):
        """Test breaking at Chinese period."""
        chunker = TextChunker(chunk_size=50, overlap=10)
        text = "这是第一句话。这是第二句话。这是第三句话。"
        result = chunker.chunk_text(text, {'source': 'test'})

        assert len(result) >= 1
        # Content should be preserved
        all_content = "".join(c.content for c in result)
        assert "第一句话" in all_content

    def test_natural_break_english_period(self):
        """Test breaking at English period."""
        chunker = TextChunker(chunk_size=50, overlap=10)
        text = "First sentence. Second sentence. Third sentence."
        result = chunker.chunk_text(text, {'source': 'test'})

        assert len(result) >= 1

    def test_chunk_metadata_preserved(self):
        """Test that metadata is preserved in chunks."""
        chunker = TextChunker()
        metadata = {
            'source': 'test_source',
            'source_id': 'test_id',
            'title': 'Test Title',
            'custom': 'value'
        }
        text = "Test content"
        result = chunker.chunk_text(text, metadata)

        assert len(result) == 1
        assert result[0].source == 'test_source'
        assert result[0].source_id == 'test_id'
        assert result[0].title == 'Test Title'

    def test_chunk_id_generation(self):
        """Test chunk ID generation."""
        chunker = TextChunker()
        text = "Test content for ID generation."
        result = chunker.chunk_text(text, {'source_id': 'my_doc'})

        assert len(result) == 1
        assert result[0].id == "my_doc_0"


class TestMarkdownChunking:
    """Tests for Markdown chunking strategy."""

    def test_chunk_markdown_empty(self):
        """Test chunking empty markdown."""
        chunker = TextChunker()
        result = chunker.chunk_markdown("", {})
        assert result == []

    def test_chunk_markdown_single_section(self):
        """Test single markdown section."""
        chunker = TextChunker()
        text = "# Title\n\nThis is content under the title."
        result = chunker.chunk_markdown(text, {'source': 'test'})

        assert len(result) == 1
        assert 'section_header' in result[0].metadata
        assert result[0].metadata['section_header'] == 'Title'

    def test_chunk_markdown_multiple_sections(self):
        """Test multiple markdown sections."""
        chunker = TextChunker()
        text = """# Main Title

Content for main section.

## Section 1

Content for section 1.

## Section 2

Content for section 2.

### Subsection

Content for subsection."""
        result = chunker.chunk_markdown(text, {'source': 'test'})

        assert len(result) >= 2
        # Check that section headers are captured
        headers = [c.metadata.get('section_header') for c in result if 'section_header' in c.metadata]
        assert len(headers) > 0

    def test_chunk_markdown_section_level(self):
        """Test section level detection."""
        chunker = TextChunker()
        text = "# Level 1\n\nContent\n\n## Level 2\n\nMore content"
        result = chunker.chunk_markdown(text, {'source': 'test'})

        # Find chunks with section_level metadata
        levels = [c.metadata.get('section_level') for c in result if 'section_level' in c.metadata]
        assert 1 in levels or 2 in levels

    def test_chunk_markdown_long_section(self):
        """Test long markdown section gets split."""
        chunker = TextChunker(chunk_size=100, overlap=20)
        text = "# Long Section\n\n" + "Content sentence. " * 50
        result = chunker.chunk_markdown(text, {'source': 'test'})

        # Long section should be split into multiple chunks
        assert len(result) > 1

    def test_chunk_markdown_code_blocks(self):
        """Test markdown with code blocks."""
        chunker = TextChunker()
        text = """# Code Example

```python
def hello():
    print("Hello, World!")
```

This is after the code."""
        result = chunker.chunk_markdown(text, {'source': 'test'})

        assert len(result) >= 1
        # Code block content should be preserved
        all_content = "".join(c.content for c in result)
        assert "print" in all_content or "hello" in all_content


class TestChunkDataclass:
    """Tests for Chunk dataclass."""

    def test_chunk_creation(self):
        """Test Chunk object creation."""
        chunk = Chunk(
            id="test_0",
            content="Test content",
            source="test",
            source_id="test_id",
            title="Test Title"
        )

        assert chunk.id == "test_0"
        assert chunk.content == "Test content"
        assert chunk.char_count == 12  # len("Test content")

    def test_chunk_to_dict(self):
        """Test Chunk serialization."""
        chunk = Chunk(
            id="test_0",
            content="Test",
            source="test",
            source_id="id",
            title="Title"
        )

        result = chunk.to_dict()
        assert isinstance(result, dict)
        assert result['id'] == "test_0"
        assert result['content'] == "Test"

    def test_chunk_char_count_auto(self):
        """Test char_count is auto-calculated."""
        chunk = Chunk(
            id="test",
            content="Hello World",
            source="test",
            source_id="id",
            title="Title"
        )

        assert chunk.char_count == 11

    def test_chunk_default_values(self):
        """Test Chunk default values."""
        chunk = Chunk(
            id="test",
            content="Test",
            source="test",
            source_id="id",
            title="Title"
        )

        assert chunk.metadata == {}
        assert chunk.chunk_index == 0
        assert chunk.total_chunks == 1


class TestDocumentChunker:
    """Tests for DocumentChunker class."""

    def test_process_empty_documents(self):
        """Test processing empty document list."""
        chunker = DocumentChunker()
        result = chunker.process_documents([])
        assert result == []

    def test_process_single_document(self):
        """Test processing single document."""
        chunker = DocumentChunker()
        docs = [{
            'content': "Test content for processing.",
            'metadata': {'source': 'test'},
            'source': 'test',
            'source_id': 'doc1',
            'title': 'Test Doc'
        }]

        result = chunker.process_documents(docs)
        assert len(result) >= 1
        assert result[0].source == 'test'

    def test_process_multiple_documents(self):
        """Test processing multiple documents."""
        chunker = DocumentChunker()
        docs = [
            {
                'content': "First document content.",
                'metadata': {},
                'source': 'test',
                'source_id': 'doc1',
                'title': 'Doc 1'
            },
            {
                'content': "Second document content.",
                'metadata': {},
                'source': 'test',
                'source_id': 'doc2',
                'title': 'Doc 2'
            }
        ]

        result = chunker.process_documents(docs)
        assert len(result) >= 2

    def test_process_mdx_document(self):
        """Test processing MDX document uses markdown strategy."""
        chunker = DocumentChunker()
        docs = [{
            'content': "# Title\n\nContent here.",
            'metadata': {'type': 'mdx'},
            'source': 'blog',
            'source_id': 'blog1',
            'title': 'Blog Post'
        }]

        result = chunker.process_documents(docs)
        assert len(result) >= 1


class TestEdgeCases:
    """Tests for edge cases and boundary conditions."""

    def test_very_long_single_word(self):
        """Test very long single word without spaces."""
        chunker = TextChunker(chunk_size=50, overlap=10)
        text = "a" * 200
        result = chunker.chunk_text(text, {'source': 'test'})

        # Should still produce chunks
        assert len(result) >= 1

    def test_unicode_content(self):
        """Test Unicode content handling."""
        chunker = TextChunker()
        text = "你好世界！这是中文测试内容。🎉"
        result = chunker.chunk_text(text, {'source': 'test'})

        assert len(result) >= 1
        assert "你好" in result[0].content

    def test_special_characters(self):
        """Test special characters handling."""
        chunker = TextChunker()
        text = "Content with <html> tags & entities \"quotes\" 'apostrophes'"
        result = chunker.chunk_text(text, {'source': 'test'})

        assert len(result) >= 1

    def test_newlines_preserved(self):
        """Test newlines are preserved."""
        chunker = TextChunker()
        text = "Line 1\nLine 2\nLine 3"
        result = chunker.chunk_text(text, {'source': 'test'})

        assert "\n" in result[0].content or len(result) > 1

    def test_tabs_preserved(self):
        """Test tabs are preserved."""
        chunker = TextChunker()
        text = "Col1\tCol2\tCol3"
        result = chunker.chunk_text(text, {'source': 'test'})

        assert "\t" in result[0].content

    def test_zero_overlap(self):
        """Test zero overlap."""
        chunker = TextChunker(chunk_size=50, overlap=0)
        text = "a" * 100
        result = chunker.chunk_text(text, {'source': 'test'})

        assert len(result) >= 1

    def test_large_overlap(self):
        """Test overlap larger than chunk size."""
        # This is a configuration error but should not crash
        chunker = TextChunker(chunk_size=50, overlap=60)
        text = "Test content for large overlap."
        result = chunker.chunk_text(text, {'source': 'test'})

        # Should still return something
        assert isinstance(result, list)


class TestPerformance:
    """Performance-related tests."""

    def test_large_document_chunking(self):
        """Test chunking a large document."""
        chunker = TextChunker(chunk_size=500, overlap=50)
        # Create a document with 10000 characters
        text = "This is a sentence. " * 500
        result = chunker.chunk_text(text, {'source': 'test'})

        # Should complete without hanging
        assert len(result) > 0
        # Verify all chunks have proper indices
        for i, chunk in enumerate(result):
            assert chunk.chunk_index == i

    def test_many_small_documents(self):
        """Test processing many small documents."""
        chunker = DocumentChunker()
        docs = [
            {
                'content': f"Document {i} content.",
                'metadata': {},
                'source': 'test',
                'source_id': f'doc{i}',
                'title': f'Doc {i}'
            }
            for i in range(100)
        ]

        result = chunker.process_documents(docs)
        assert len(result) >= 100


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
