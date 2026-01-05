# /v1/embeddings Endpoint

POST /v1/embeddings

Body: `{ "input": "single string" }` or `{ "inputs": ["a","b"] }`

Behavior:
- Attempts to call Mistral embeddings API using `MISTRAL_API_KEY` and `EMBEDDING_MODEL` from `.env`.
- If the provider call fails or key is absent, falls back to a deterministic SHA256-based embedding (stable across runs).
- Returns: `{ data: [ { input, embedding, metadata } ] }` where `metadata.modelUsed` indicates `mistral` or `deterministic`.

Example (curl):

```bash
curl -X POST http://localhost:3000/v1/embeddings \
  -H "Content-Type: application/json" \
  -d '{"input":"Given a user logs in, then should see dashboard"}'
```

Notes:
- Uses Node global `fetch` (Node 18+) to contact the provider. If your Node version lacks `fetch`, either upgrade or install `node-fetch` and adapt the service.
- Adjust `MISTRAL_API_KEY`, `EMBEDDING_MODEL`, and `EMBEDDING_DIM` in `.env` as needed.
