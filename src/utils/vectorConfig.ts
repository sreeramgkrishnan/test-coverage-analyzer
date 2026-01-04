export const vectorConfig = {
  collection: process.env.MONGODB_COLLECTION || 'scenarios',
  vectorIndexName: process.env.MONGODB_VECTOR_INDEX || 'vector_index_test_coverage',
  maxCandidates: parseInt(process.env.VECTOR_MAX_CANDIDATES || '10000', 10),
  defaultTopK: parseInt(process.env.VECTOR_DEFAULT_TOPK || '5', 10),
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
  mongoDbName: process.env.MONGODB_DB_NAME || 'test',
};

export default vectorConfig;
