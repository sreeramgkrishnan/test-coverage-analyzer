import dotenv from 'dotenv';
dotenv.config();
export const config = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  jobPollIntervalMs: process.env.JOB_POLL_INTERVAL_MS ? parseInt(process.env.JOB_POLL_INTERVAL_MS, 10) : 500,
  embeddingDim: process.env.EMBEDDING_DIM ? parseInt(process.env.EMBEDDING_DIM, 10) : 1024,
  embeddingModel: process.env.EMBEDDING_MODEL || 'mistral-embed',
  llmModel: process.env.LLM_MODEL || process.env.GROQ_MODEL || 'meta-llama/llama-4-scout-17b-16e-instruct',
  groqModel: process.env.GROQ_MODEL || process.env.LLM_MODEL,
  mistralApiKey: process.env.MISTRAL_API_KEY || '',
  groqApiKey: process.env.GROQ_API_KEY || '',
  maxRequestBodyBytes: process.env.MAX_REQUEST_BODY_BYTES ? parseInt(process.env.MAX_REQUEST_BODY_BYTES, 10) : 1048576
};

export const mongo = {
  uri: process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/test-coverage-analyzer',
  dbName: process.env.MONGODB_DB_NAME || process.env.MONGO_DB || 'test-coverage-analyzer',
  collection: process.env.MONGODB_COLLECTION || undefined,
  vectorIndex: process.env.MONGODB_VECTOR_INDEX || undefined,
  bm25Index: process.env.MONGODB_BM25_INDEX || undefined
};