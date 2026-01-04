import { Router, Request, Response } from 'express';
import generateEmbedding from '../../services/embeddings';

const router = Router();

router.post('/v1/embeddings', async (req: Request, res: Response) => {
  try {
    const { input, model } = req.body;
    if (typeof input !== 'string') return res.status(400).json({ error: '"input" must be a string (single input per request)' });
    const result = await generateEmbedding(input, model);
    res.json({ data: [result] });
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? 'failed to generate embeddings' });
  }
});

export default router;
