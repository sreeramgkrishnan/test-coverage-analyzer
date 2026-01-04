import { Router, Request, Response } from 'express';
import { hybridSearch } from '../../../services/hybridSearch';

const router = Router();

router.post('/v1/search/hybrid', async (req: Request, res: Response) => {
  try {
    const { feature, scenarios, topK, threshold, filter } = req.body;
    const result = await hybridSearch({ feature, scenarios, topK, threshold, filter });
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? 'hybrid search failed' });
  }
});

export default router;
