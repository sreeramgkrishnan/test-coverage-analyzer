import { Router, Request, Response } from 'express';
import { MongoClient } from 'mongodb';
import { search as vectorSearch } from '../../../services/vectorSearch';
import { vectorConfig } from '../../../utils/vectorConfig';
import { hybridConfig } from '../../../utils/hybridConfig';
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
 * POST /v1/search/hybrid
 * Body: { query: string, topK?: number, vectorWeight?: number, deterministicWeight?: number, filter?: object }
 * Combines deterministic text matching with vector similarity search.
 */
router.post('/v1/search/hybrid', async (req: Request, res: Response) => {
  try {
    const startTime = Date.now();
    const { query, topK, vectorWeight, deterministicWeight, filter } = req.body;

    if (typeof query !== 'string' || query.length === 0) {
      return res.status(400).json({ error: '"query" must be a non-empty string' });
    }

    const resultLimit = typeof topK === 'number' ? topK : hybridConfig.defaultTopK;
    const vWeight = typeof vectorWeight === 'number' ? vectorWeight : hybridConfig.vectorWeight;
    const dWeight = typeof deterministicWeight === 'number' ? deterministicWeight : hybridConfig.deterministicWeight;

    // Run both searches in parallel
    const [vectorResults, deterministicResults] = await Promise.all([
      vectorSearch(query, resultLimit * 2, filter || {}),
      (async () => {
        const c = await getClient();
        const col = c.db(vectorConfig.mongoDbName).collection(vectorConfig.collection);
        const regex = new RegExp(query, deterministicConfig.caseSensitive ? '' : 'i');
        const searchFilter = { ...filter, text: { $regex: regex } };
        const docs = await col.find(searchFilter).limit(resultLimit * 2).toArray();
        return docs.map((d: any) => ({
          id: d._id,
          score: 1.0,
          text: d.text || d.metadata?.text || '',
          metadata: d.metadata || {},
          document: d
        }));
      })()
    ]);

    // Merge results by ID and compute weighted hybrid score
    const mergedMap = new Map<string, any>();

    // Normalize vector scores (0-1 range)
    const maxVectorScore = Math.max(...vectorResults.map((r: any) => r.score), 0.001);
    vectorResults.forEach((r: any) => {
      const normalizedScore = r.score / maxVectorScore;
      mergedMap.set(String(r.id), {
        ...r,
        vectorScore: normalizedScore,
        deterministicScore: 0,
        hybridScore: normalizedScore * vWeight
      });
    });

    // Add or update with deterministic results
    deterministicResults.forEach((r: any) => {
      const id = String(r.id);
      if (mergedMap.has(id)) {
        const existing = mergedMap.get(id);
        existing.deterministicScore = 1.0;
        existing.hybridScore = (existing.vectorScore * vWeight) + (1.0 * dWeight);
      } else {
        mergedMap.set(id, {
          ...r,
          vectorScore: 0,
          deterministicScore: 1.0,
          hybridScore: 1.0 * dWeight
        });
      }
    });

    // Sort by hybrid score and take top K
    const rankedResults = Array.from(mergedMap.values())
      .sort((a, b) => b.hybridScore - a.hybridScore)
      .slice(0, resultLimit);

    const items = rankedResults.map((r: any) => ({
      headline: r.text || r.metadata?.headline || r.metadata?.name || '',
      sourceUrl: r.metadata?.sourceUrl || '',
      publishedAt: r.metadata?.publishedAt || r.document?.createdAt || null,
      sourceDomain: r.metadata?.sourceDomain || '',
      snippet: r.text ? r.text.slice(0, 150) + '...' : '',
      score: r.hybridScore,
      vectorScore: r.vectorScore,
      deterministicScore: r.deterministicScore,
      section: r.metadata?.section || null,
    }));

    const processingTime = Date.now() - startTime;
    const sources = [...new Set(items.map((i: any) => i.sourceDomain).filter(Boolean))];
    const summary = `Found ${items.length} articles related to "${query}" using hybrid search (vector + deterministic) from sources including ${sources.join(', ') || 'unknown'}.`;

    res.json({
      success: true,
      query,
      timestamp: new Date().toISOString(),
      itemsCount: items.length,
      items,
      summary,
      processingTime,
      searchMeta: {
        vectorResultsCount: vectorResults.length,
        deterministicResultsCount: deterministicResults.length,
        vectorWeight: vWeight,
        deterministicWeight: dWeight
      }
    });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e?.message ?? 'hybrid search failed' });
  }
});

export default router;
