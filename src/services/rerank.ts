import generateEmbedding from './embeddings';
import { rerankConfig } from '../utils/rerankConfig';

function cosine(a: number[], b: number[]) {
  const n = Math.min(a.length, b.length);
  let dp = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < n; i++) {
    const ai = a[i] || 0;
    const bi = b[i] || 0;
    dp += ai * bi;
    na += ai * ai;
    nb += bi * bi;
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  if (denom === 0) return 0;
  return dp / denom;
}

/**
 * Re-rank candidate results for a query.
 * candidates: array of { id?, score?, metadata?, embedding?, text? }
 */
export async function rerankCandidates(
  query: string,
  candidates: any[],
  useLLM = false,
  topK = rerankConfig.defaultTopK
) {
  if (!query || !Array.isArray(candidates)) return [];

  if (useLLM) {
    try {
      // lazy require to avoid circular imports during boot
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const llm = require('./llmOrchestrator') as any;
      if (llm && typeof llm.reRank === 'function') {
        const out = await llm.reRank({ query, candidates, model: rerankConfig.llmModel, topK });
        return Array.isArray(out) ? out.slice(0, topK) : [];
      }
    } catch {
      // fall back to embedding-based rerank
    }
  }

  const qEmb = await generateEmbedding(query);
  const prepared = await Promise.all(
    candidates.map(async (c: any) => {
      const embeddingFromCandidate =
        c.embedding || c.metadata?.embedding || (typeof c.text === 'string' ? (await generateEmbedding(c.text)).embedding : undefined) ||
        (typeof c.metadata?.text === 'string' ? (await generateEmbedding(c.metadata.text)).embedding : undefined);

      const fallbackText =
        typeof c.text === 'string' ? c.text : typeof c.metadata?.text === 'string' ? c.metadata.text : c.id ? String(c.id) : JSON.stringify(c.metadata || {});

      const emb = embeddingFromCandidate || (await generateEmbedding(fallbackText)).embedding;
      const score = cosine(qEmb.embedding, emb);
      return { ...c, score };
    })
  );

  return prepared.sort((a, b) => b.score - a.score).slice(0, topK);
}

export default rerankCandidates;
