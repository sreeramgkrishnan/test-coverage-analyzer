export const llmConfig = {
  provider: process.env.LLM_PROVIDER || 'groq',
  groqApiKey: process.env.GROQ_API_KEY || '',
  groqModel: process.env.GROQ_MODEL || 'meta-llama/llama-4-scout-17b-16e-instruct',
  mistralApiKey: process.env.MISTRAL_API_KEY || '',
  defaultModel: process.env.LLM_MODEL || 'meta-llama/llama-4-scout-17b-16e-instruct',
  maxTokens: parseInt(process.env.LLM_MAX_TOKENS || '2000', 10),
  temperature: parseFloat(process.env.LLM_TEMPERATURE || '0.7'),
  timeout: parseInt(process.env.LLM_TIMEOUT_MS || '30000', 10),
};

export default llmConfig;
