import { Router, Request, Response } from 'express';
import { MongoClient } from 'mongodb';
import { vectorConfig } from '../../../utils/vectorConfig';
import { deterministicConfig } from '../../../utils/deterministicConfig';

const router = Router();

let client: MongoClient | undefined;

async function getClient(): Promise<MongoClient> {
  if (!client) {
    client = new MongoClient(vectorConfig.mongoUri);
    await client.connect();
  }
  return client;
}

/**
 * POST /v1/search/deterministic
 * Body: { query: string, limit?: number, matchMode?: string, caseSensitive?: boolean, filter?: object }
 * Performs deterministic text matching (no embeddings, no knn) using MongoDB text search or regex.
 */
router.post('/v1/search/deterministic', async (req: Request, res: Response) => {
  try {
    const startTime = Date.now();
    const { query, limit, matchMode, caseSensitive, filter } = req.body;
    
    if (typeof query !== 'string' || query.length === 0) {
      return res.status(400).json({ error: '"query" must be a non-empty string' });
    }

    const resultLimit = typeof limit === 'number' ? limit : deterministicConfig.defaultLimit;
    const mode = matchMode || deterministicConfig.matchMode;
    const isCaseSensitive = typeof caseSensitive === 'boolean' ? caseSensitive : deterministicConfig.caseSensitive;

    const c = await getClient();
    const col = c.db(vectorConfig.mongoDbName).collection(vectorConfig.collection);

    // Build regex pattern based on match mode
    let pattern: string;
    switch (mode) {
      case 'exact':
        pattern = `^${query}$`;
        break;
      case 'startsWith':
        pattern = `^${query}`;
        break;
      case 'contains':
      default:
        pattern = query;
        break;
    }

    const regexOptions = isCaseSensitive ? '' : 'i';
    const regex = new RegExp(pattern, regexOptions);

    // Search in text field using regex
    const searchFilter = {
      ...filter,
      text: { $regex: regex }
    };

    const docs = await col.find(searchFilter).limit(resultLimit).toArray();

    const items = docs.map((d: any) => ({
      headline: d.text || d.metadata?.headline || d.metadata?.name || '',
      sourceUrl: d.metadata?.sourceUrl || '',
      publishedAt: d.metadata?.publishedAt || d.createdAt || null,
      sourceDomain: d.metadata?.sourceDomain || '',
      snippet: d.text ? d.text.slice(0, 150) + '...' : '',
      score: 1.0, // deterministic match has uniform score
      section: d.metadata?.section || null,
    }));

    const processingTime = Date.now() - startTime;
    const sources = [...new Set(items.map((i: any) => i.sourceDomain).filter(Boolean))];
    const summary = `Found ${items.length} articles related to "${query}" from sources including ${sources.join(', ') || 'unknown'}.`;

    res.json({
      success: true,
      query,
      timestamp: new Date().toISOString(),
      itemsCount: items.length,
      items,
      summary,
      processingTime,
    });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e?.message ?? 'deterministic search failed' });
  }
});

export default router;
