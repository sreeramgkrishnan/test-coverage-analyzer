import { logger } from '../utils/logger';

export const summarizeForLLM = async (coverageSummary: any) => {
  try {
    const total = coverageSummary.scenarios?.length ?? 0;
    const avg = total === 0 ? 0 : coverageSummary.scenarios.reduce((s:any,o:any)=>s+ (o.coverage ?? 0),0)/total;
    return { text: `Feature ${coverageSummary.featureId} average coverage ${(avg*100).toFixed(1)}%`, avg };
  } catch (e:any) {
    logger.error('LLM summarization failed', e.message || e);
    throw new Error('LLM failure');
  }
}

export const generateMissingScenarios = async (featureSummary: any) => {
  const suggestions: string[] = [];
  for (const s of featureSummary.scenarios || []) {
    if ((s.coverage ?? 0) < 0.5) {
      suggestions.push(`Add scenario to cover remaining steps for ${s.scenarioId}`);
    }
  }
  return { suggestions };
}