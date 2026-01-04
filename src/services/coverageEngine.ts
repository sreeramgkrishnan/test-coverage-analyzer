import { coverageStore } from '../data/coverageStore';

export const deterministicCoverage = async (feature: any) => {
  // feature: { id, name, scenarios: [{id, title, steps: [{id,text}], executedStepIds?: string[] }] }
  const result = { featureId: feature.id, scenarios: [] as any[] };
  for (const s of feature.scenarios || []) {
    const total = (s.steps || []).length;
    const executed = (s.executedStepIds || []).length;
    const pct = total === 0 ? 0 : executed / total;
    result.scenarios.push({ scenarioId: s.id, totalSteps: total, executedSteps: executed, coverage: pct });
  }
  coverageStore.set(feature.id, result);
  return result;
}
// src/services/coverageEngine.ts
// This file is intentionally left blank.