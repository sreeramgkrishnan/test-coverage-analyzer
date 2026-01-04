import { Router, Request, Response } from 'express';
import { logger } from '../utils/logger';
import { ping } from '../utils/db';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  logger.info('health check');
  res.json({ status: 'ok' });
});

router.get('/db', async (_req: Request, res: Response) => {
  try {
    const ok = await ping();
    if (ok) return res.json({ status: 'ok', db: 'connected' });
    return res.status(503).json({ status: 'error', db: 'disconnected' });
  } catch (e: any) {
    logger.error('db health failed', e.message || e);
    res.status(500).json({ status: 'error', error: e.message || 'error' });
  }
});

export default router;
export const healthCheck = (req: Request, res: Response) => {
    res.status(200).json({ status: 'healthy' });
};