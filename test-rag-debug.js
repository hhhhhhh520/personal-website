const fs = require('fs');
const path = require('path');

// Load data
const docsPath = path.join(process.cwd(), 'public', 'rag-index', 'documents.json');
const embPath = path.join(process.cwd(), 'public', 'rag-index', 'embeddings.json');

const docs = JSON.parse(fs.readFileSync(docsPath, 'utf-8'));
const embeddings = JSON.parse(fs.readFileSync(embPath, 'utf-8'));

console.log('Total docs:', docs.length);
console.log('Total embeddings:', embeddings.count);
console.log('Embedding dimension:', embeddings.dimension);

// Test query
const query = '详细介绍一下校园百事通';

// Tokenize
function tokenizeChinese(text, minLength = 2) {
  const normalizedText = text.toLowerCase();
  const chinesePattern = /[一-龥]+/g;
  const chineseSequences = normalizedText.match(chinesePattern) || [];
  const terms = [];

  for (const seq of chineseSequences) {
    if (seq.length <= 4) {
      if (seq.length >= minLength) terms.push(seq);
    } else {
      for (let n = 2; n <= 4; n++) {
        for (let i = 0; i <= seq.length - n; i++) {
          terms.push(seq.slice(i, i + n));
        }
      }
    }
  }

  const englishPattern = /[a-z0-9]+/g;
  const englishMatches = normalizedText.match(englishPattern) || [];
  terms.push(...englishMatches.filter(t => t.length >= minLength));

  return [...new Set(terms)];
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Keyword search
function keywordSearch(query, docs, config = { titleWeight: 3.0, contentWeight: 0.5, maxResults: 20 }) {
  const { titleWeight, contentWeight, maxResults } = config;
  const queryTerms = tokenizeChinese(query);

  console.log('\nQuery terms:', queryTerms.slice(0, 10).join(', '), '...');

  const scores = new Map();

  for (const doc of docs) {
    const title = doc.title.toLowerCase();
    const content = doc.content.toLowerCase();
    let docScore = 0;

    for (const term of queryTerms) {
      const escapedTerm = escapeRegExp(term);

      if (title.includes(term)) {
        const titleMatches = (title.match(new RegExp(escapedTerm, 'g')) || []).length;
        docScore += titleMatches * titleWeight;
      }

      const contentMatches = (content.match(new RegExp(escapedTerm, 'g')) || []).length;
      const saturatedScore = contentMatches / (1 + contentMatches * 0.1);
      docScore += saturatedScore * contentWeight;
    }

    if (docScore > 0) scores.set(doc.id, docScore);
  }

  return [...scores.entries()]
    .map(([docId, score]) => ({ docId, score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);
}

// Vector search
function cosineSimilarity(a, b) {
  let dotProduct = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
}

function computePseudoQueryEmbedding(keywordResults, docIds, vectors, dimension, topK = 3) {
  const queryEmbedding = new Array(dimension).fill(0);
  const topDocs = keywordResults.slice(0, topK);

  if (topDocs.length === 0) return queryEmbedding;

  for (const { docId } of topDocs) {
    const idx = docIds.indexOf(docId);
    if (idx !== -1) {
      const vec = vectors[idx];
      for (let i = 0; i < vec.length; i++) {
        queryEmbedding[i] += vec[i];
      }
    }
  }

  for (let i = 0; i < queryEmbedding.length; i++) {
    queryEmbedding[i] /= topDocs.length;
  }

  return queryEmbedding;
}

function vectorSearch(queryEmbedding, docIds, vectors, maxResults = 20) {
  const results = [];
  for (let i = 0; i < docIds.length; i++) {
    const similarity = cosineSimilarity(queryEmbedding, vectors[i]);
    results.push({ docId: docIds[i], score: similarity });
  }
  return results.sort((a, b) => b.score - a.score).slice(0, maxResults);
}

function rrfFusion(vectorResults, keywordResults, k = 60) {
  const docScores = new Map();

  for (let rank = 0; rank < vectorResults.length; rank++) {
    const { docId } = vectorResults[rank];
    const score = 1.0 / (k + rank + 1);
    docScores.set(docId, (docScores.get(docId) || 0) + score);
  }

  for (let rank = 0; rank < keywordResults.length; rank++) {
    const { docId } = keywordResults[rank];
    const score = 1.0 / (k + rank + 1);
    docScores.set(docId, (docScores.get(docId) || 0) + score);
  }

  return [...docScores.entries()]
    .map(([docId, score]) => ({ docId, score }))
    .sort((a, b) => b.score - a.score);
}

// Run hybrid search
console.log('\n=== Hybrid Search Test ===');
console.log('Query:', query);

const keywordResults = keywordSearch(query, docs);
console.log('\nTop 5 keyword results:');
keywordResults.slice(0, 5).forEach((r, i) => {
  const doc = docs.find(d => d.id === r.docId);
  console.log(`${i + 1}. [${r.score.toFixed(2)}] ${doc.title} (${doc.source_id})`);
});

const queryEmbedding = computePseudoQueryEmbedding(
  keywordResults,
  embeddings.doc_ids,
  embeddings.vectors,
  embeddings.dimension,
  3
);

const vectorResults = vectorSearch(queryEmbedding, embeddings.doc_ids, embeddings.vectors, 10);
console.log('\nTop 5 vector results (pseudo-query):');
vectorResults.slice(0, 5).forEach((r, i) => {
  const doc = docs.find(d => d.id === r.docId);
  console.log(`${i + 1}. [${r.score.toFixed(4)}] ${doc.title} (${doc.source_id})`);
});

const fusedResults = rrfFusion(vectorResults, keywordResults, 60);
console.log('\nTop 5 RRF fused results:');
fusedResults.slice(0, 5).forEach((r, i) => {
  const doc = docs.find(d => d.id === r.docId);
  console.log(`${i + 1}. [${r.score.toFixed(4)}] ${doc.title} (${doc.source_id})`);
});
