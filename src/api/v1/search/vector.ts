import { Router, Request, Response } from 'express';
import { search } from '../../../services/vectorSearch';
import { vectorConfig } from '../../../utils/vectorConfig';

const router = Router();

router.post('/v1/search/vector', async (req: Request, res: Response) => {
  try {
    const startTime = Date.now();
    const { query, topK, filter } = req.body;
    if (typeof query !== 'string' || query.length === 0) {
      return res.status(400).json({ error: '"query" must be a non-empty string' });
    }
    const k = typeof topK === 'number' ? topK : vectorConfig.defaultTopK;
    const results = await search(query, k, filter || {});
    
    const items = results.map((r: any) => ({
      headline: r.text || r.metadata?.headline || r.metadata?.name || '',
      sourceUrl: r.metadata?.sourceUrl || '',
      publishedAt: r.metadata?.publishedAt || r.document?.createdAt || null,
      sourceDomain: r.metadata?.sourceDomain || '',
      snippet: r.text ? r.text.slice(0, 150) + '...' : '',
      score: r.score,
      section: r.metadata?.section || null,
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
    res.status(500).json({ success: false, error: e?.message ?? 'vector search failed' });
  }
});

export default router;
