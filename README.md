# RAG-based Test Coverage Analyzer

## Overview
The RAG-based Test Coverage Analyzer is a modular monolith application designed to analyze Gherkin E2E tests. It provides various endpoints for health checks, embedding generation, coverage analysis, and LLM orchestration.

## Project Structure
```
test-coverage-analyzer
├── src
│   ├── api
│   ├── services
│   ├── domain
│   ├── data
│   ├── pipeline
│   ├── utils
│   └── app.ts
├── tests
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## Features
- **Health Check**: Simple endpoint to verify the service is running.
- **Embedding Generation**: Generate scenario embeddings using a fixed model.
- **Coverage Analysis**: Analyze feature, scenario, and step coverage.
- **Vector Similarity Search**: Perform vector similarity searches with metadata.
- **Hybrid Analysis**: Combine deterministic coverage and vector search.
- **LLM Integration**: Summarize coverage results and generate missing scenarios.
- **Asynchronous Processing**: Support for async job submission and polling for results.

## Getting Started
1. Clone the repository:
   ```
   git clone <repository-url>
   cd test-coverage-analyzer
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env` and configure as needed.

4. Run the application:
   ```
   npm start
   ```

## API Endpoints
- **GET** `/health`: Returns health status.
- **POST** `/embed`: Generates scenario embeddings.
- **GET** `/metadata/check`: Verifies metadata store connectivity.
- **POST** `/coverage/deterministic`: Analyzes coverage.
- **POST** `/coverage/vector-search`: Performs vector similarity search.
- **POST** `/coverage/hybrid`: Combines deterministic and vector search.
- **POST** `/llm/gap-analysis`: Summarizes coverage and calls LLM.
- **POST** `/llm/missing-scenarios`: Generates missing Gherkin scenarios.
- **POST** `/pipeline/full-analysis`: Orchestrates full analysis asynchronously.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.