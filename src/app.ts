import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import health from './api/health';
import det from './api/coverage/deterministic';
import vec from './api/coverage/vectorSearch';
import hybrid from './api/coverage/hybrid';
import gap from './api/llm/gapAnalysis';
import missing from './api/llm/missingScenarios';
import metadata from './api/metadata';
import scenarios from './api/scenarios';
import { generateEmbeddings } from './api/embed';
import searchRouter from './api/search';
import { jobQueue } from './pipeline/jobQueue';
import { config } from './utils/config';
import { logger } from './utils/logger';

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: (config.maxRequestBodyBytes || 1048576) + 'b' }));

// basic request logging
app.use((req, _res, next) => {
  logger.info(req.method, req.path);
  next();
});

// mount health router at both /health and /api/health for compatibility
app.use('/health', health);
app.use('/api/health', health);
app.use('/v1/health', health);
app.use(det);
app.use(vec);
app.use(hybrid);
app.use(gap);
app.use(missing);

// embeddings endpoint
app.post('/v1/embeddings', generateEmbeddings);

// vector search
app.use('/', searchRouter);

// job polling
app.get('/pipeline/jobs/:id', (req, res) => {
  const j = jobQueue.get(req.params.id);
  if (!j) return res.status(404).json({ error: 'not found' });
  res.json(j);
});

// metadata routes (connectivity check)
app.use(metadata);
// scenarios data endpoints
app.use('/v1/scenarios', scenarios);

const port = config.port;
app.listen(port, () => {
  logger.info(`server running on ${port}`);
  logger.info(`health endpoints: http://localhost:${port}/health  |  http://localhost:${port}/api/health  |  http://localhost:${port}/v1/health  |  http://localhost:${port}/v1/health/db`);
  // print rerank endpoint
  // eslint-disable-next-line no-console
  console.log(`POST http://localhost:${port}/v1/search/rerank`);
  // print summarize endpoint
  // eslint-disable-next-line no-console
  console.log(`POST http://localhost:${port}/v1/search/summarize`);
});

export default app;