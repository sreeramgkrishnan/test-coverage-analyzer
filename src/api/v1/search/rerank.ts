import { Router, Request, Response } from 'express';
import { rerankCandidates } from '../../../services/rerank';

const router = Router();

router.post('/v1/search/rerank', async (req: Request, res: Response) => {
  try {
    const { query, candidates, useLLM, topK } = req.body;
    if (typeof query !== 'string' || !Array.isArray(candidates)) {
      return res.status(400).json({ error: '"query" (string) and "candidates" (array) are required' });
    }
    const results = await rerankCandidates(query, candidates, Boolean(useLLM), typeof topK === 'number' ? topK : undefined);
    res.json({ data: results });
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? 'rerank failed' });
  }
});

export default router;
