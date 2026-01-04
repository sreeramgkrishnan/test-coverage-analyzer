import { embeddingsStore } from '../data/embeddingsStore';
import { config } from '../utils/config';

const makeEmbedding = (text: string, dim = config.embeddingDim) => {
  const vec = new Array(dim).fill(0).map((_, i) => {
    const c = text.charCodeAt(i % text.length) || 0;
    return ((c % 100) - 50) / 50; // deterministic pseudo-values
  });
  return vec;
}

const dot = (a: number[], b: number[]) => a.reduce((s, v, i) => s + v * (b[i] ?? 0), 0);
const norm = (a: number[]) => Math.sqrt(a.reduce((s, v) => s + v * v, 0));

export const indexScenario = (id: string, text: string, metadata?: Record<string, any>) => {
  const v = makeEmbedding(text);
  embeddingsStore.upsert(id, v, metadata);
}

export const search = (query: string, topK = 5) => {
  const qv = makeEmbedding(query);
  const all = embeddingsStore.getAll();
  const scored = all.map(r => {
    const score = dot(qv, r.vector) / (norm(qv) * norm(r.vector) || 1e-6);
    return { id: r.id, score, metadata: r.metadata };
  }).sort((a,b)=>b.score-a.score);
  return scored.slice(0, topK);
}
// src/services/vectorSearch.ts
// This file is intentionally left blank.