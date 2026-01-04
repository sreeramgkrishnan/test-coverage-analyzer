export const summarizeConfig = {
  defaultModel: process.env.SUMMARIZE_LLM_MODEL || process.env.LLM_MODEL || 'gpt-4',
  fallbackMaxChars: parseInt(process.env.SUMMARIZE_FALLBACK_MAX_CHARS || '500', 10),
  defaultMaxItems: parseInt(process.env.SUMMARIZE_DEFAULT_MAX_ITEMS || '5', 10),
};

export default summarizeConfig;
