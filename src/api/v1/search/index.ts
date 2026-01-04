import { Router, Request, Response } from 'express';
import generateEmbedding from '../../../services/embeddings';
import { indexScenario } from '../../../services/vectorSearch';

const router = Router();

/**
 * POST /v1/search/index
 * Body: { id: string, text: string, metadata?: object }
 * Generates embedding for `text` and upserts into vector collection.
 */
router.post('/v1/search/index', async (req: Request, res: Response) => {
  try {
    const { id, text, metadata } = req.body;
    if (typeof id !== 'string' || typeof text !== 'string') {
      return res.status(400).json({ error: '"id" and "text" (strings) are required' });
    }
    const emb = await generateEmbedding(text);
    await indexScenario(id, emb.embedding, { ...(metadata || {}), text });
    res.json({ ok: true, id });
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? 'indexing failed' });
  }
});

export default router;
