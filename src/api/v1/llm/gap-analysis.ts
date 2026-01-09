import { Router, Request, Response } from 'express';
import { gapAnalysis } from '../../../services/llmOrchestrator';

const router = Router();

/**
 * POST /v1/llm/gap-analysis
 * Body: { deterministicResults?: object, vectorResults?: object, hybridResults?: object, model?: string }
 * Analyzes test coverage gaps using LLM based on search results.
 */
router.post('/v1/llm/gap-analysis', async (req: Request, res: Response) => {
  try {
    const startTime = Date.now();
    const { deterministicResults, vectorResults, hybridResults, model } = req.body;

    const result = await gapAnalysis({
      deterministicResults,
      vectorResults,
      hybridResults,
      model,
    });

    const processingTime = Date.now() - startTime;

    res.json({
      ...result,
      timestamp: new Date().toISOString(),
      processingTime,
    });
  } catch (e: any) {
    res.status(500).json({ 
      success: false, 
      error: e?.message ?? 'gap analysis failed' 
    });
  }
});

export default router;
