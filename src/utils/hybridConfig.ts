export const hybridConfig = {
  defaultThreshold: parseFloat(process.env.HYBRID_LOW_COVERAGE_THRESHOLD || '0.5'),
  defaultTopK: parseInt(process.env.HYBRID_DEFAULT_TOPK || '5', 10),
  maxParallelSearches: parseInt(process.env.HYBRID_MAX_PARALLEL || '5', 10),
};

export default hybridConfig;
