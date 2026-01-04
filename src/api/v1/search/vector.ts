import { Router, Request, Response } from 'express';
import { search } from '../../../services/vectorSearch';
import { vectorConfig } from '../../../utils/vectorConfig';

const router = Router();

router.post('/v1/search/vector', async (req: Request, res: Response) => {
  try {
    const { query, topK, filter } = req.body;
    if (typeof query !== 'string' || query.length === 0) {
      return res.status(400).json({ error: '"query" must be a non-empty string' });
    }
    const k = typeof topK === 'number' ? topK : vectorConfig.defaultTopK;
    const results = await search(query, k, filter || {});
    res.json({ data: results });
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? 'vector search failed' });
  }
});

export default router;
