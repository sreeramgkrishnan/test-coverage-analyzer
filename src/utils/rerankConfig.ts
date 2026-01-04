export const rerankConfig = {
  defaultTopK: parseInt(process.env.RERANK_DEFAULT_TOPK || '5', 10),
  llmModel: process.env.RERANK_LLM_MODEL || process.env.LLM_MODEL || 'gpt-4',
};

export default rerankConfig;
