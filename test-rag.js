const fs = require('fs');
const path = require('path');

// Load documents
const docsPath = path.join(process.cwd(), 'public', 'rag-index', 'documents.json');
const docs = JSON.parse(fs.readFileSync(docsPath, 'utf-8'));

// Tokenize function (same as in route.ts)
function tokenizeChinese(text, minLength = 2) {
  const normalizedText = text.toLowerCase();
  const chinesePattern = /[一-龥]+/g;
  const chineseSequences = normalizedText.match(chinesePattern) || [];
  const terms = [];

  for (const seq of chineseSequences) {
    if (seq.length <= 4) {
      if (seq.length >= minLength) {
        terms.push(seq);
      }
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

// Test query
const query = '详细介绍一下校园百事通';
const terms = tokenizeChinese(query);
console.log('Query terms:', terms);

// Keyword search
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const scores = new Map();
const titleWeight = 3.0;
const contentWeight = 0.5;

for (const doc of docs) {
  const title = doc.title.toLowerCase();
  const content = doc.content.toLowerCase();
  let docScore = 0;

  for (const term of terms) {
    const escapedTerm = escapeRegExp(term);

    if (title.includes(term)) {
      const titleMatches = (title.match(new RegExp(escapedTerm, 'g')) || []).length;
      docScore += titleMatches * titleWeight;
    }

    const contentMatches = (content.match(new RegExp(escapedTerm, 'g')) || []).length;
    const saturatedScore = contentMatches / (1 + contentMatches * 0.1);
    docScore += saturatedScore * contentWeight;
  }

  if (docScore > 0) {
    scores.set(doc.id, docScore);
  }
}

const sorted = [...scores.entries()]
  .map(([docId, score]) => ({ docId, score }))
  .sort((a, b) => b.score - a.score)
  .slice(0, 10);

console.log('\nTop 10 keyword results:');
sorted.forEach((r, i) => {
  const doc = docs.find(d => d.id === r.docId);
  console.log(`${i + 1}. [${r.score.toFixed(2)}] ${doc.title} (source: ${doc.source_id})`);
});
