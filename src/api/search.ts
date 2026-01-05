import { Router } from 'express';
import embeddingService from '../services/embeddingService';
import vectorSearchService from '../services/vectorSearchService';
import { logger } from '../utils/logger';
import { config } from '../utils/config';
import llmRerankService from '../services/llmRerankService';
import llmSummarizeService from '../services/llmSummarizeService';

const router = Router();

// POST /v1/search/vector
// body: { input?: string, embedding?: number[], topK?: number, filter?: object }
router.post('/v1/search/vector', async (req, res) => {
  try {
    const body = req.body || {};
    const topK = Math.max(1, Math.min(100, Number(body.topK || 10)));
    const filter = body.filter || {};

    let vector: number[] | undefined;
    if (Array.isArray(body.embedding)) {
      vector = body.embedding as number[];
    } else if (typeof body.input === 'string') {
      const resp = await embeddingService.embed(body.input);
      vector = resp.embeddings[0];
    } else {
      return res.status(400).json({ error: 'Provide "input" (string) or "embedding" (array)' });
    }

    if (!Array.isArray(vector)) return res.status(500).json({ error: 'invalid_vector' });
    if (vector.length !== config.embeddingDim) {
      logger.warn('vector dimension mismatch', { got: vector.length, expected: config.embeddingDim });
    }

    const results = await vectorSearchService.searchByVector(vector, topK, filter);
    return res.json({ data: results });
  } catch (err: any) {
    logger.error('search/vector error', err?.message ?? err);
    return res.status(500).json({ error: 'vector_search_failed', details: err?.message ?? String(err) });
  }
});

// POST /v1/search/rerank
// Body: { query: string, candidates: [{ id, text?, score?, metadata? }], topK?: number }
router.post('/v1/search/rerank', async (req, res) => {
  try {
    const body = req.body || {};
    const query = typeof body.query === 'string' ? body.query : undefined;
    const candidates = Array.isArray(body.candidates) ? body.candidates : undefined;
    const topK = Math.max(1, Math.min(100, Number(body.topK || 10)));

    if (!query || !candidates) return res.status(400).json({ error: 'Provide "query" (string) and "candidates" (array)' });

    const results = await llmRerankService.rerank(query, candidates, topK);
    return res.json({ data: results });
  } catch (err: any) {
    logger.error('rerank error', err?.message ?? err);
    return res.status(500).json({ error: 'rerank_failed', details: err?.message ?? String(err) });
  }
});

// POST /v1/search/summarize
// Body: { query?: string, candidates: [{ id, text?, score?, metadata? }], topK?: number }
router.post('/v1/search/summarize', async (req, res) => {
  try {
    const body = req.body || {};
    const query = typeof body.query === 'string' ? body.query : undefined;
    const candidates = Array.isArray(body.candidates) ? body.candidates : undefined;
    const topK = Math.max(1, Math.min(100, Number(body.topK || 5)));

    if (!candidates) return res.status(400).json({ error: 'Provide "candidates" (array)' });

    const out = await llmSummarizeService.summarize(query, candidates, topK);
    return res.json({ data: out });
  } catch (err: any) {
    logger.error('summarize error', err?.message ?? err);
    return res.status(500).json({ error: 'summarize_failed', details: err?.message ?? String(err) });
  }
});

export default router;
