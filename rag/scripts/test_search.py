#!/usr/bin/env python3
"""
RAG Search Test Script

Test the generated index with sample queries.
"""

import json
import numpy as np
from pathlib import Path
from typing import List, Tuple


def cosine_similarity(a: List[float], b: List[float]) -> float:
    """Compute cosine similarity between two vectors."""
    a_np = np.array(a)
    b_np = np.array(b)
    return float(np.dot(a_np, b_np) / (np.linalg.norm(a_np) * np.linalg.norm(b_np)))


class SimpleRAGSearch:
    """Simple RAG search using pre-computed embeddings."""

    def __init__(self, index_dir: str):
        """Load index files."""
        index_path = Path(index_dir)

        # Load documents
        with open(index_path / 'documents.json', 'r', encoding='utf-8') as f:
            self.documents = json.load(f)

        # Load embeddings
        with open(index_path / 'embeddings.json', 'r', encoding='utf-8') as f:
            embeddings_data = json.load(f)
            self.embeddings = embeddings_data['vectors']
            self.doc_ids = embeddings_data['doc_ids']
            self.dimension = embeddings_data['dimension']

        # Load metadata
        with open(index_path / 'metadata.json', 'r', encoding='utf-8') as f:
            self.metadata = json.load(f)

        print(f"Loaded {len(self.documents)} documents with {self.dimension}-dim embeddings")

    def search(self, query_embedding: List[float], top_k: int = 5) -> List[Tuple[dict, float]]:
        """
        Search for similar documents.

        Args:
            query_embedding: Query embedding vector
            top_k: Number of results to return

        Returns:
            List of (document, similarity_score) tuples
        """
        similarities = []
        for i, emb in enumerate(self.embeddings):
            sim = cosine_similarity(query_embedding, emb)
            similarities.append((i, sim))

        # Sort by similarity (descending)
        similarities.sort(key=lambda x: x[1], reverse=True)

        # Return top_k results
        results = []
        for idx, score in similarities[:top_k]:
            doc = self.documents[idx]
            results.append((doc, score))

        return results


def test_search():
    """Test the search functionality."""
    from sentence_transformers import SentenceTransformer

    # Paths
    index_dir = Path(__file__).parent.parent.parent / 'public' / 'rag-index'
    model_path = r"D:/my project/xybst/校园百事通项目/campus_helper/models/embedding/BAAI_bge-large-zh-v1.5/"

    # Load search engine
    search = SimpleRAGSearch(str(index_dir))

    # Load embedding model
    print(f"\nLoading embedding model...")
    model = SentenceTransformer(model_path)

    # Test queries
    test_queries = [
        "LangGraph 状态机设计",
        "RAG 检索增强生成",
        "多 Agent 并发",
        "AI 应用开发项目",
        "求职面试经验",
    ]

    print("\n" + "=" * 60)
    print("RAG Search Test Results")
    print("=" * 60)

    for query in test_queries:
        print(f"\nQuery: {query}")
        print("-" * 40)

        # Generate query embedding
        query_embedding = model.encode(query, normalize_embeddings=True).tolist()

        # Search
        results = search.search(query_embedding, top_k=3)

        for i, (doc, score) in enumerate(results, 1):
            print(f"  {i}. [{score:.4f}] {doc['title']}")
            print(f"     Source: {doc['source']}/{doc['source_id']}")
            print(f"     Preview: {doc['content'][:80]}...")

    print("\n" + "=" * 60)
    print("Test complete!")


if __name__ == "__main__":
    test_search()