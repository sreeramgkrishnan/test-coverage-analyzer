import { hybridConfig } from '../utils/hybridConfig';
import { search } from './vectorSearch';
import { deterministicCoverage } from './coverageEngine';

type HybridParams = {
  feature?: any;
  scenarios?: any[];
  topK?: number;
  threshold?: number;
  filter?: any;
};

export async function hybridSearch(params: HybridParams) {
  const topK = params.topK ?? hybridConfig.defaultTopK;
  const threshold = typeof params.threshold === 'number' ? params.threshold : hybridConfig.defaultThreshold;
  const filter = params.filter ?? {};

  let detResult: any = null;
  if (params.feature) {
    try {
      detResult = await deterministicCoverage(params.feature as any);
    } catch (e: any) {
      throw new Error(`deterministic coverage failed: ${e?.message || e}`);
    }
  }

  const scenarios: any[] = (detResult && (detResult.scenarios || detResult)) || params.scenarios || [];

  const lowCoverage = scenarios.filter((s: any) => {
    const cov = typeof s.coverage === 'number' ? s.coverage : (s.coverageScore ?? 0);
    return cov < threshold;
  });

  const vectorResults = await Promise.all(
    lowCoverage.map(async (s: any) => {
      const text = s.text || s.name || s.description || '';
      const results = await search(text, topK, filter);
      return { scenarioId: s.id ?? s._id ?? s.name, vector: results };
    })
  );

  const hybridScenarios = scenarios.map((s: any) => {
    const vr = vectorResults.find((r: any) => r.scenarioId === (s.id ?? s._id ?? s.name));
    return { ...s, vectorResults: vr ? vr.vector : [] };
  });

  return { deterministic: detResult, scenarios: hybridScenarios, lowCoverageCount: lowCoverage.length };
}

export default hybridSearch;
