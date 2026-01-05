import fetch from 'node-fetch';
import { config } from '../utils/config';
import { logger } from '../utils/logger';

type Candidate = { id: any; text?: string; score?: number; metadata?: Record<string, any> };

class LlmSummarizeService {
  private apiKey = config.groqApiKey;
  private model = config.summarizeModel || config.groqModel || config.llmModel;

  // Simple deterministic fallback: concatenate topK candidate texts
  private deterministicSummary(candidates: Candidate[], topK: number) {
    const tops = candidates.slice(0, topK).map((c) => c.text || '').join('\n\n');
    const trimmed = tops.length > 1000 ? tops.slice(0, 1000) + '...' : tops;
    return { summary: trimmed, model: 'deterministic' as const };
  }

  async summarize(query: string | undefined, candidates: Candidate[], topK = 5) {
    if (!Array.isArray(candidates) || candidates.length === 0) return { summary: '', model: 'deterministic' as const };

    // prefer LLM if key present
    if (!this.apiKey) {
      logger.info('LLM summarize: no GROQ_API_KEY, using deterministic fallback');
      return this.deterministicSummary(candidates, topK);
    }

    const promptParts: string[] = [];
    promptParts.push('You are a concise summarizer for candidate scenario texts.');
    if (query) promptParts.push(`Query: "${query.replace(/"/g, '\\"')}"`);
    promptParts.push('Candidates:');
    candidates.slice(0, Math.max(topK, 10)).forEach((c, i) => {
      const text = (c.text || '').replace(/\n/g, ' ').slice(0, 2000);
      promptParts.push(`${i + 1}. id=${String(c.id)} score=${typeof c.score === 'number' ? c.score.toFixed(4) : '0.0000'} text="${text}"`);
    });
    promptParts.push('Produce a short (1-3 sentence) summary of the most relevant scenarios and a bullet list of 3 concise takeaways. Return JSON: { "summary": "...", "takeaways": ["...","...","..."] }');

    const prompt = promptParts.join('\n');

    try {
      const resp = await fetch('https://api.groq.ai/v1/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.apiKey}` },
        body: JSON.stringify({ model: this.model, prompt, max_output_tokens: 512, temperature: 0.0 }),
      });
      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(`LLM response ${resp.status}: ${txt}`);
      }
      const json = await resp.json();
      const textOut = (json?.completion || json?.output || json?.text || (Array.isArray(json?.choices) ? json.choices[0]?.text : undefined) || '').toString();
      const match = textOut.match(/(\{[\s\S]*\})/s);
      const jsonStr = match ? match[1] : textOut;
      const parsed = JSON.parse(jsonStr);
      if (parsed && typeof parsed.summary === 'string') return { summary: parsed.summary, takeaways: parsed.takeaways || [], model: 'groq' as const };
      // unexpected shape -> fallback
      logger.warn('LLM summarize returned unexpected shape, falling back to deterministic');
      return this.deterministicSummary(candidates, topK);
    } catch (err: any) {
      logger.warn('LLM summarize failed, falling back to deterministic:', err?.message ?? err);
      return this.deterministicSummary(candidates, topK);
    }
  }
}

export default new LlmSummarizeService();
