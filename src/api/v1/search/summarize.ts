import { Router, Request, Response } from 'express';
import { summarizeItems } from '../../../services/summarize';

const router = Router();

router.post('/v1/search/summarize', async (req: Request, res: Response) => {
  try {
    const { items, query, model, useLLM, maxItems } = req.body;
    if (!Array.isArray(items)) return res.status(400).json({ error: '"items" must be an array' });
    const result = await summarizeItems(items, { query, model, useLLM, maxItems });
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? 'summarization failed' });
  }
});

export default router;
