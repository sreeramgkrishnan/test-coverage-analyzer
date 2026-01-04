import { Router, Request, Response } from 'express';
import { ping } from '../utils/db';
import { logger } from '../utils/logger';

const router = Router();

router.get('/metadata/check', async (_req: Request, res: Response) => {
  try {
    const ok = await ping();
    if (ok) return res.json({ ok: true });
    return res.status(500).json({ ok: false });
  } catch (e:any) {
    logger.error('metadata check failed', e.message || e);
    res.status(500).json({ ok: false, error: e.message || 'error' });
  }
});

export default router;
import { Request, Response } from 'express';

export const checkMetadataStore = async (req: Request, res: Response) => {
    // Placeholder for metadata store connectivity check
    res.status(200).json({ message: 'Metadata store is reachable' });
};