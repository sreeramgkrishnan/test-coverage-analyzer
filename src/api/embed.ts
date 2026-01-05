import { Request, Response } from 'express';
import embeddingService from '../services/embeddingService';
import { logger } from '../utils/logger';

export const generateEmbeddings = async (req: Request, res: Response) => {
    try {
        const body = req.body || {};
        const inputs = body.input ?? body.inputs;
        if (!inputs) return res.status(400).json({ error: 'missing input(s)' });

        const { embeddings, provider } = await embeddingService.embed(inputs);
        const items = Array.isArray(inputs) ? inputs : [inputs];

        const data = items.map((inp, i) => ({
            input: inp,
            embedding: embeddings[i],
            metadata: {
                length: typeof inp === 'string' ? inp.length : null,
                modelUsed: provider
            }
        }));

        res.json({ data });
    } catch (err: any) {
        logger.error('generateEmbeddings error', err?.message || err);
        res.status(500).json({ error: 'embedding_failed', details: err?.message || String(err) });
    }
};