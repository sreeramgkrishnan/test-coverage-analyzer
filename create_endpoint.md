# create_endpoint.md

Purpose: guidelines and checklist to add a new API endpoint consistent with Architecture.md.

1. Create route file
   - Location: src/api/<version>/<name>.ts
   - Use Express Router
   - Validate inputs and return HTTP 4xx for client errors
   - Handlers must return JSON and catch errors returning 500 with { error }

2. Implement service logic
   - Location: src/services/<name>.ts
   - Keep business logic out of routes
   - Export typed functions; prefer async functions

3. Wire into app
   - Import router in src/app.ts and register with app.use(...)
   - Use mount path consistent with versioning (e.g., /v1/<name>)

4. Async job pattern
   - Support ?async=true for long-running tasks
   - Use pipeline/jobQueue.create(id) then return { jobId }
   - Update status with jobQueue.setRunning / complete / fail

5. Tests
   - Unit tests in test/ for services
   - Integration tests for routes using supertest

6. Observability
   - Add request/response logging via utils/logger
   - Emit a high-level success/failure metric log entry per handler

7. Examples
   - Reference implementations:
     - src/api/v1/embeddings.ts
     - src/services/embeddings.ts

Notes:
- Restart the dev server after adding files.
- Keep controllers thin; put parsing/validation and orchestration into services.
