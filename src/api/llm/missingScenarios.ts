import { Router } from 'express';
import { generateMissingScenarios } from '../../services/llmOrchestrator';
import { jobQueue } from '../../pipeline/jobQueue';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.post('/llm/missing-scenarios', async (req, res) => {
  const asyncJob = req.query.async === 'true';
  const payload = req.body; // expected { featureSummary }
  if (asyncJob) {
    const id = uuidv4();
    jobQueue.create(id);
    (async () => {
      try {
        jobQueue.setRunning(id);
        const r = await generateMissingScenarios(payload.featureSummary);
        jobQueue.complete(id, r);
      } catch (e:any) {
        jobQueue.fail(id, e.message || 'error');
      }
    })();
    return res.json({ jobId: id });
  }
  try {
    const r = await generateMissingScenarios(payload.featureSummary);
    res.json({ result: r });
  } catch (e:any) {
    res.status(500).json({ error: e.message || 'failed' });
  }
});

export default router;
// src/api/llm/missingScenarios.ts
import { Request, Response } from 'express';

export const generateMissingScenarios = async (req: Request, res: Response) => {
    // Placeholder for generating missing Gherkin scenarios
    res.status(200).json({ message: 'Missing scenarios generation endpoint' });
};