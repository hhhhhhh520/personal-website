#!/usr/bin/env python3
"""
RAG Index Builder Script

This script builds the vector index for the RAG system.
It orchestrates the data extraction, chunking, and embedding process.

Usage:
    python build_index.py                    # Build if data changed
    python build_index.py --check            # Only check, don't build
    python build_index.py --force            # Force rebuild

Output files (in public/rag-index/):
    - documents.json: List of document chunks
    - embeddings.json: Vector embeddings (1024 dimensions)
    - metadata.json: Index metadata and statistics
"""

import json
import argparse
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional
from datetime import datetime
import hashlib
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# ============================================================================
# Data Hash Calculation (SUB-016)
# ============================================================================

def get_data_source_files(project_root: Path) -> List[Path]:
    """
    Get all data source files that affect the index.

    Returns:
        List of Path objects for all relevant data files
    """
    data_files = []

    # TypeScript data files
    data_dir = project_root / 'data'
    if data_dir.exists():
        for pattern in ['*.ts', '*.tsx']:
            data_files.extend(data_dir.glob(pattern))

    # Blog MDX files
    blog_dir = project_root / 'content' / 'blog'
    if blog_dir.exists():
        data_files.extend(blog_dir.glob('*.mdx'))

    # Project documentation Markdown files
    docs_dir = project_root / 'docs' / 'projects'
    if docs_dir.exists():
        data_files.extend(docs_dir.glob('*.md'))

    # Extracted content JSON (intermediate file)
    extracted_json = project_root / 'rag' / 'data' / 'extracted_content.json'
    if extracted_json.exists():
        data_files.append(extracted_json)

    # Sort for consistent hash
    return sorted(data_files)


def compute_data_hash(files: List[Path]) -> str:
    """
    Compute a combined MD5 hash of all data source files.

    Args:
        files: List of files to hash

    Returns:
        MD5 hash string
    """
    hasher = hashlib.md5(usedforsecurity=False)

    for file_path in files:
        if file_path.exists():
            content = file_path.read_bytes()
            # Include file path for uniqueness
            hasher.update(str(file_path.relative_to(file_path.parents[3])).encode())
            hasher.update(content)
            logger.debug(f"Hashed: {file_path.name} ({len(content)} bytes)")

    return hasher.hexdigest()


def load_existing_metadata(output_dir: Path) -> Optional[Dict[str, Any]]:
    """
    Load existing metadata from the output directory.

    Args:
        output_dir: Directory containing index files

    Returns:
        Metadata dict or None if not exists
    """
    metadata_path = output_dir / 'metadata.json'
    if metadata_path.exists():
        try:
            with open(metadata_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            logger.warning(f"Failed to load existing metadata: {e}")
    return None


def check_index_needs_update(project_root: Path, output_dir: Path) -> Dict[str, Any]:
    """
    Check if the index needs to be updated.

    Args:
        project_root: Project root directory
        output_dir: Index output directory

    Returns:
        Dict with keys:
            - needs_update: bool
            - reason: str
            - current_hash: str
            - stored_hash: Optional[str]
    """
    # Get all data source files
    data_files = get_data_source_files(project_root)
    logger.info(f"Found {len(data_files)} data source files")

    # Compute current hash
    current_hash = compute_data_hash(data_files)
    logger.info(f"Current data hash: {current_hash[:16]}...")

    # Load existing metadata
    existing_metadata = load_existing_metadata(output_dir)

    if existing_metadata is None:
        return {
            'needs_update': True,
            'reason': 'No existing index found',
            'current_hash': current_hash,
            'stored_hash': None
        }

    stored_hash = existing_metadata.get('data_hash')

    if stored_hash is None:
        return {
            'needs_update': True,
            'reason': 'Existing index has no data_hash field',
            'current_hash': current_hash,
            'stored_hash': None
        }

    if stored_hash != current_hash:
        return {
            'needs_update': True,
            'reason': 'Data files have changed',
            'current_hash': current_hash,
            'stored_hash': stored_hash
        }

    return {
        'needs_update': False,
        'reason': 'Data unchanged, index is up to date',
        'current_hash': current_hash,
        'stored_hash': stored_hash
    }


class EmbeddingGenerator:
    """
    Generate embeddings using local bge-large-zh model.
    """

    def __init__(self, model_path: str):
        """
        Initialize the embedding generator with a local model.

        Args:
            model_path: Path to the local embedding model
        """
        self.model_path = model_path
        self.model = None
        self._load_model()

    def _load_model(self):
        """Load the sentence transformer model."""
        try:
            from sentence_transformers import SentenceTransformer
            logger.info(f"Loading embedding model from: {self.model_path}")
            self.model = SentenceTransformer(self.model_path)
            logger.info(f"Model loaded successfully. Embedding dimension: {self.model.get_sentence_embedding_dimension()}")
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            raise

    def generate(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for a list of texts.

        Args:
            texts: List of text strings to embed

        Returns:
            List of embedding vectors (each is a list of floats)
        """
        if not texts:
            return []

        logger.info(f"Generating embeddings for {len(texts)} texts...")

        try:
            # Generate embeddings
            embeddings = self.model.encode(
                texts,
                show_progress_bar=True,
                convert_to_numpy=True,
                normalize_embeddings=True  # Normalize for cosine similarity
            )

            # Convert to list format
            return [emb.tolist() for emb in embeddings]

        except Exception as e:
            logger.error(f"Failed to generate embeddings: {e}")
            raise

    def generate_single(self, text: str) -> List[float]:
        """
        Generate embedding for a single text.

        Args:
            text: Text string to embed

        Returns:
            Embedding vector as list of floats
        """
        embeddings = self.generate([text])
        return embeddings[0] if embeddings else []

    @property
    def dimension(self) -> int:
        """Get the embedding dimension."""
        return self.model.get_sentence_embedding_dimension() if self.model else 0


class IndexBuilder:
    """
    Build and save the RAG index.
    """

    def __init__(
        self,
        model_path: str,
        output_dir: str,
        chunk_size: int = 400,
        overlap: int = 50
    ):
        """
        Initialize the index builder.

        Args:
            model_path: Path to the embedding model
            output_dir: Directory to save index files
            chunk_size: Target chunk size in characters
            overlap: Overlap between chunks
        """
        self.model_path = model_path
        self.output_dir = Path(output_dir)
        self.chunk_size = chunk_size
        self.overlap = overlap

        # Ensure output directory exists
        self.output_dir.mkdir(parents=True, exist_ok=True)

        # Initialize components
        self.embedding_generator = EmbeddingGenerator(model_path)

    def build_index(self, documents: List[Dict[str, Any]], data_hash: Optional[str] = None) -> Dict[str, Any]:
        """
        Build the complete index from documents.

        Args:
            documents: List of extracted documents
            data_hash: Hash of source data files for incremental update detection

        Returns:
            Metadata dictionary about the built index
        """
        from chunker import DocumentChunker

        logger.info(f"Building index from {len(documents)} documents...")

        # Step 1: Chunk documents
        logger.info("Step 1: Chunking documents...")
        chunker = DocumentChunker(self.chunk_size, self.overlap)
        chunks = chunker.process_documents(documents)
        logger.info(f"Created {len(chunks)} chunks")

        # Step 2: Generate embeddings
        logger.info("Step 2: Generating embeddings...")
        texts = [chunk.content for chunk in chunks]
        embeddings = self.embedding_generator.generate(texts)
        logger.info(f"Generated {len(embeddings)} embeddings")

        # Step 3: Prepare document data
        logger.info("Step 3: Preparing document data...")
        documents_data = []
        for chunk, embedding in zip(chunks, embeddings):
            doc_data = {
                'id': chunk.id,
                'content': chunk.content,
                'source': chunk.source,
                'source_id': chunk.source_id,
                'title': chunk.title,
                'metadata': chunk.metadata,
                'chunk_index': chunk.chunk_index,
                'total_chunks': chunk.total_chunks,
                'char_count': chunk.char_count,
                'embedding_hash': self._compute_hash(embedding)
            }
            documents_data.append(doc_data)

        # Step 4: Save index files
        logger.info("Step 4: Saving index files...")
        self._save_documents(documents_data)
        self._save_embeddings(embeddings, [doc['id'] for doc in documents_data])

        # Step 5: Generate and save metadata
        metadata = self._generate_metadata(documents, chunks, embeddings, data_hash)
        self._save_metadata(metadata)

        logger.info("Index build complete!")
        return metadata

    def _compute_hash(self, embedding: List[float]) -> str:
        """Compute a hash for an embedding vector."""
        data = json.dumps(embedding[:10]).encode()  # Use first 10 dims for quick hash
        return hashlib.md5(data, usedforsecurity=False).hexdigest()[:8]

    def _save_documents(self, documents: List[Dict[str, Any]]):
        """Save documents to JSON file."""
        output_path = self.output_dir / 'documents.json'
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(documents, f, ensure_ascii=False, indent=2)
        logger.info(f"Saved {len(documents)} documents to {output_path}")

    def _save_embeddings(self, embeddings: List[List[float]], doc_ids: List[str]):
        """Save embeddings to JSON file."""
        output_path = self.output_dir / 'embeddings.json'
        embeddings_data = {
            'dimension': self.embedding_generator.dimension,
            'count': len(embeddings),
            'doc_ids': doc_ids,
            'vectors': embeddings
        }
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(embeddings_data, f)
        logger.info(f"Saved {len(embeddings)} embeddings to {output_path}")

    def _save_metadata(self, metadata: Dict[str, Any]):
        """Save metadata to JSON file."""
        output_path = self.output_dir / 'metadata.json'
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, ensure_ascii=False, indent=2)
        logger.info(f"Saved metadata to {output_path}")

    def _generate_metadata(
        self,
        documents: List[Dict[str, Any]],
        chunks: List[Any],
        embeddings: List[List[float]],
        data_hash: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate metadata about the index."""
        # Count by source
        source_counts = {}
        for doc in documents:
            source = doc.get('source', 'unknown')
            source_counts[source] = source_counts.get(source, 0) + 1

        # Calculate statistics
        total_chars = sum(len(chunk.content) for chunk in chunks)
        avg_chunk_size = total_chars / len(chunks) if chunks else 0

        metadata = {
            'version': '1.1.0',
            'created_at': datetime.now().isoformat(),
            'embedding_model': str(self.model_path),
            'embedding_dimension': self.embedding_generator.dimension,
            'total_documents': len(documents),
            'total_chunks': len(chunks),
            'total_embeddings': len(embeddings),
            'source_counts': source_counts,
            'chunk_settings': {
                'chunk_size': self.chunk_size,
                'overlap': self.overlap
            },
            'statistics': {
                'total_characters': total_chars,
                'average_chunk_size': round(avg_chunk_size, 2),
                'min_chunk_size': min(len(c.content) for c in chunks) if chunks else 0,
                'max_chunk_size': max(len(c.content) for c in chunks) if chunks else 0
            }
        }

        # Add data hash for incremental update detection (SUB-016)
        if data_hash:
            metadata['data_hash'] = data_hash

        return metadata


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description='Build RAG index with incremental update support',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
    python build_index.py           # Build if data changed (default)
    python build_index.py --check   # Only check if update needed, don't build
    python build_index.py --force   # Force rebuild regardless of data changes
        """
    )
    parser.add_argument(
        '--data',
        type=str,
        default=None,
        help='Path to extracted content JSON (default: rag/data/extracted_content.json)'
    )
    parser.add_argument(
        '--output',
        type=str,
        default=None,
        help='Output directory (default: public/rag-index/)'
    )
    parser.add_argument(
        '--model',
        type=str,
        default=None,
        help='Path to embedding model (default: bge-large-zh-v1.5)'
    )
    parser.add_argument(
        '--chunk-size',
        type=int,
        default=400,
        help='Target chunk size in characters (default: 400)'
    )
    parser.add_argument(
        '--overlap',
        type=int,
        default=50,
        help='Chunk overlap in characters (default: 50)'
    )
    # SUB-017: Incremental update arguments
    parser.add_argument(
        '--check',
        action='store_true',
        help='Only check if update is needed, do not build'
    )
    parser.add_argument(
        '--force',
        action='store_true',
        help='Force rebuild even if data has not changed'
    )

    args = parser.parse_args()

    # Determine paths
    script_dir = Path(__file__).parent
    project_root = script_dir.parent.parent

    data_path = Path(args.data) if args.data else project_root / 'rag' / 'data' / 'extracted_content.json'
    output_dir = Path(args.output) if args.output else project_root / 'public' / 'rag-index'
    model_path = args.model or r"D:/my project/xybst/校园百事通项目/campus_helper/models/embedding/BAAI_bge-large-zh-v1.5/"

    logger.info(f"Project root: {project_root}")
    logger.info(f"Data path: {data_path}")
    logger.info(f"Output directory: {output_dir}")
    logger.info(f"Model path: {model_path}")

    # SUB-017: Check if update is needed
    check_result = check_index_needs_update(project_root, output_dir)

    # Handle --check mode (only report, don't build)
    if args.check:
        print("\n" + "=" * 50)
        print("Index Update Check")
        print("=" * 50)
        print(f"Status: {'NEEDS UPDATE' if check_result['needs_update'] else 'UP TO DATE'}")
        print(f"Reason: {check_result['reason']}")
        print(f"Current hash: {check_result['current_hash'][:16]}...")
        if check_result['stored_hash']:
            print(f"Stored hash:  {check_result['stored_hash'][:16]}...")
        print("=" * 50)

        # Return exit code: 0 = up to date, 1 = needs update
        return 1 if check_result['needs_update'] else 0

    # Skip build if not needed and not forced
    if not args.force and not check_result['needs_update']:
        logger.info(f"Skipping build: {check_result['reason']}")
        print("\n" + "=" * 50)
        print("Index is up to date - no rebuild needed")
        print("Use --force to rebuild anyway")
        print("=" * 50)
        return 0

    # Log why we're building
    if args.force:
        logger.info("Force rebuild requested")
    else:
        logger.info(f"Rebuilding: {check_result['reason']}")

    # Load documents
    if not data_path.exists():
        logger.error(f"Data file not found: {data_path}")
        logger.error("Run 'python rag/scripts/extract_content.py' first")
        return 1

    with open(data_path, 'r', encoding='utf-8') as f:
        documents = json.load(f)

    logger.info(f"Loaded {len(documents)} documents")

    # Build index
    builder = IndexBuilder(
        model_path=model_path,
        output_dir=str(output_dir),
        chunk_size=args.chunk_size,
        overlap=args.overlap
    )

    metadata = builder.build_index(documents, data_hash=check_result['current_hash'])

    # Print summary
    print("\n" + "=" * 50)
    print("Index Build Summary")
    print("=" * 50)
    print(f"Total documents: {metadata['total_documents']}")
    print(f"Total chunks: {metadata['total_chunks']}")
    print(f"Total embeddings: {metadata['total_embeddings']}")
    print(f"Embedding dimension: {metadata['embedding_dimension']}")
    print(f"Source distribution: {metadata['source_counts']}")
    print(f"Average chunk size: {metadata['statistics']['average_chunk_size']} chars")
    print(f"Data hash: {metadata.get('data_hash', 'N/A')[:16]}...")
    print(f"Output directory: {output_dir}")
    print("=" * 50)

    return 0


if __name__ == "__main__":
    exit(main())