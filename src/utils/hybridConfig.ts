export const hybridConfig = {
  defaultThreshold: parseFloat(process.env.HYBRID_LOW_COVERAGE_THRESHOLD || '0.5'),
  defaultTopK: parseInt(process.env.HYBRID_DEFAULT_TOPK || '10', 10),
  maxParallelSearches: parseInt(process.env.HYBRID_MAX_PARALLEL || '5', 10),
  vectorWeight: parseFloat(process.env.HYBRID_VECTOR_WEIGHT || '0.5'),
  deterministicWeight: parseFloat(process.env.HYBRID_DETERMINISTIC_WEIGHT || '0.5'),
};

export default hybridConfig;
