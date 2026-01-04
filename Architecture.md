You are a senior Node.js + Express engineer. Generate a modular monolith project for a RAG-based Test Coverage Analyzer system for Gherkin E2E tests. Follow these instructions:

1. Project Structure:
   - src/
     - api/          --> Express routes for endpoints
     - services/     --> CoverageEngine, VectorSearch, LLMOrchestrator
     - domain/       --> Canonical Gherkin model: Feature, Scenario, Step, Tag, Flow
     - data/         --> Embeddings store, metadata store, coverage storage
     - pipeline/     --> Full analysis orchestration
     - utils/        --> Logging, error handling, config

2. API Endpoints:
   - /health [GET] → return simple health check
   - /embed [POST] → generate scenario embeddings using fixed model
   - /metadata/check [GET] → verify metadata store connectivity
   - /coverage/deterministic [POST] → Feature/Scenario/Step coverage
   - /coverage/vector-search [POST] → vector similarity search with metadata
   - /coverage/hybrid [POST] → deterministic + vector search
   - /llm/gap-analysis [POST] → summarize coverage and call LLM
   - /llm/missing-scenarios [POST] → generate missing Gherkin scenarios
   - /pipeline/full-analysis [POST] → orchestrate all above async

3. Execution Pattern:
   - All analysis APIs should support async job submission and polling for results

4. Canonical Model:
   - Feature → Scenario → Step → Tag → Flow
   - Used consistently across deterministic, vector, and LLM pipelines

5. Embeddings:
   - Single fixed model
   - Include structured metadata: feature name, tags, step count

6. Hybrid Analysis:
   - Deterministic coverage first
   - Vector similarity applied to low-coverage scenarios

7. LLM Usage:
   - Summarize deterministic + vector coverage results
   - Fail fast if LLM fails

8. Logging & Metrics:
   - Basic request/response logs
   - High-level success/failure metrics only

Generate the project incrementally, starting with:
1. Project scaffolding with directories and placeholder files
2. Health check endpoint
3. Canonical Gherkin model
4. Deterministic coverage endpoint
5. Vector similarity endpoint
6. Hybrid endpoint
7. LLM orchestration endpoints
8. Full async pipeline