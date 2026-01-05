import fetch from 'node-fetch';
import { config } from '../utils/config';
import { logger } from '../utils/logger';

type Candidate = {
  id: any;
  text?: string;
  score?: number;
  metadata?: Record<string, any>;
};

class LlmRerankService {
  private apiKey = config.groqApiKey;
  private model = config.rerankModel || config.groqModel || config.llmModel;

  private tokenize(s = ''): string[] {
    return String(s).toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(Boolean);
  }

  private jaccard(a: string[], b: string[]) {
    const sa = new Set(a);
    const sb = new Set(b);
    const inter = [...sa].filter((x) => sb.has(x)).length;
    const uni = new Set([...sa, ...sb]).size || 1;
    return inter / uni;
  }

  private deterministicRerank(query: string, candidates: Candidate[], topK: number) {
    const qTokens = this.tokenize(query);
    const scored = candidates.map((c) => {
      const det = this.jaccard(qTokens, this.tokenize(c.text || ''));
      const orig = typeof c.score === 'number' ? c.score : 0;
      const combined = 0.6 * orig + 0.4 * det;
      return { ...c, finalScore: combined };
    });
    return scored.sort((a, b) => (b.finalScore ?? 0) - (a.finalScore ?? 0)).slice(0, topK);
  }

  async rerank(query: string, candidates: Candidate[], topK = 10) {
    if (!query || !Array.isArray(candidates) || candidates.length === 0) return [];

    if (!this.apiKey) {
      logger.info('LLM rerank: no GROQ_API_KEY, using deterministic fallback');
      return this.deterministicRerank(query, candidates, topK);
    }

    const promptParts: string[] = [];
    promptParts.push('You are a relevance re-ranker. Given the query, rank candidates by relevance.');
    promptParts.push(`Query: """${query.replace(/"/g, '\\"')}"""`);
    promptParts.push('');
    promptParts.push('Candidates:');
    candidates.forEach((c, i) => {
      const text = (c.text || '').replace(/\n/g, ' ').slice(0, 2000);
      promptParts.push(`${i + 1}. id=${String(c.id)} score=${typeof c.score === 'number' ? c.score.toFixed(4) : '0.0000'} text="${text}"`);
    });
    promptParts.push('');
    promptParts.push('Return a JSON array of objects: [{ "id": "<id>", "score": <relevance_score_float> }, ...] sorted by score desc. Scores should be numbers in [0,1].');
    const prompt = promptParts.join('\n');

    try {
      const resp = await fetch('https://api.groq.ai/v1/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({ model: this.model, prompt, max_output_tokens: 512, temperature: 0 }),
      });

      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(`LLM response ${resp.status}: ${txt}`);
      }
      const json = await resp.json();
      const textOut = (json?.completion || json?.output || json?.text || (Array.isArray(json?.choices) ? json.choices[0]?.text : undefined) || '').toString();

      const match = textOut.match(/(\[.*\])/s);
      const jsonStr = match ? match[1] : textOut;
      const parsed = JSON.parse(jsonStr);
      if (!Array.isArray(parsed)) throw new Error('Unexpected LLM return shape');

      const idToCandidate = new Map(candidates.map((c) => [String(c.id), c]));
      const ranked = parsed
        .map((p: any) => {
          const id = String(p.id);
          const cand = idToCandidate.get(id);
          return cand ? { ...cand, finalScore: Number(p.score) } : null;
        })
        .filter(Boolean)
        .sort((a: any, b: any) => (b.finalScore ?? 0) - (a.finalScore ?? 0))
        .slice(0, topK);
      return ranked;
    } catch (err: any) {
      logger.warn('LLM rerank failed, falling back to deterministic:', err?.message ?? err);
      return this.deterministicRerank(query, candidates, topK);
    }
  }
}

export default new LlmRerankService();
