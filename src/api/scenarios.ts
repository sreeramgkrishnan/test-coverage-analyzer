import { Router, Request, Response } from 'express';
import { getDb } from '../utils/db';
import { mongo as mongoConfig } from '../utils/config';
import { ObjectId } from 'mongodb';
import { logger } from '../utils/logger';

const router = Router();

// GET /v1/scenarios - list documents (limit to 100)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const db = getDb();
    const colName = mongoConfig.collection || 'scenarios';
    const docs = await db.collection(colName).find({}).limit(100).toArray();
    res.json(docs);
  } catch (e: any) {
    logger.error('fetch scenarios failed', e.message || e);
    res.status(500).json({ error: e.message || 'failed to fetch scenarios' });
  }
});

// GET /v1/scenarios/:id - fetch single document by _id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'invalid id' });
    const db = getDb();
    const colName = mongoConfig.collection || 'scenarios';
    const doc = await db.collection(colName).findOne({ _id: new ObjectId(id) });
    if (!doc) return res.status(404).json({ error: 'not found' });
    res.json(doc);
  } catch (e: any) {
    logger.error('fetch scenario failed', e.message || e);
    res.status(500).json({ error: e.message || 'failed to fetch scenario' });
  }
});

export default router;
