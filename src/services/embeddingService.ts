import crypto from 'crypto';
import { config } from '../utils/config';
import { logger } from '../utils/logger';

type Provider = 'mistral' | 'deterministic';

export class EmbeddingService {
  dim: number;
  model: string;
  apiKey: string;
  mistralUrl: string;

  constructor() {
    this.dim = config.embeddingDim || 1024;
    this.model = config.embeddingModel || 'mistral-embed';
    this.apiKey = config.mistralApiKey || '';
    // Default Mistral-like embeddings endpoint; adjust if needed for your provider
    this.mistralUrl = 'https://api.mistral.ai/v1/embeddings';
  }

  async embed(inputs: string | string[]): Promise<{ embeddings: number[][]; provider: Provider }>{
    const items = Array.isArray(inputs) ? inputs : [inputs];

    if (this.apiKey) {
      try {
        const payload = { model: this.model, input: items };
        // use global fetch (Node 18+). If not available, this will throw and fall back.
        const fetchFn: any = (globalThis as any).fetch;
        if (!fetchFn) throw new Error('fetch unavailable');

        const res = await fetchFn(this.mistralUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`
          },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`mistral error ${res.status}: ${txt}`);
        }

        const json = await res.json();
        // support common response shapes
        let out: number[][] | undefined;
        if (Array.isArray(json.data)) {
          out = json.data.map((d: any) => d.embedding || d.vector || []);
        } else if (Array.isArray(json.embeddings)) {
          out = json.embeddings.map((e: any) => e.embedding || e);
        }

        if (!out) throw new Error('unexpected mistral response shape');

        const normalized = out.map((v) => this._ensureDimAndNormalize(v));
        return { embeddings: normalized, provider: 'mistral' };
      } catch (err: any) {
        logger.warn('Mistral embedding failed, falling back to deterministic:', err?.message || err);
        const deterministic = items.map((t) => this._deterministicVector(t));
        return { embeddings: deterministic, provider: 'deterministic' };
      }
    }

    logger.info('No MISTRAL_API_KEY configured; using deterministic embeddings');
    const deterministic = items.map((t) => this._deterministicVector(t));
    return { embeddings: deterministic, provider: 'deterministic' };
  }

  _ensureDimAndNormalize(vec: any[]): number[] {
    const out = new Array(this.dim).fill(0);
    if (Array.isArray(vec)) {
      for (let i = 0; i < Math.min(vec.length, this.dim); i++) {
        const n = Number(vec[i]) || 0;
        out[i] = n;
      }
    }
    // L2 normalize
    const norm = Math.sqrt(out.reduce((s, v) => s + v * v, 0)) || 1;
    return out.map((v) => v / norm);
  }

  _deterministicVector(text: string): number[] {
    const vec = new Array<number>(this.dim);
    let filled = 0;
    let counter = 0;

    while (filled < this.dim) {
      const h = crypto.createHash('sha256');
      h.update(String(counter));
      h.update(text);
      const digest = h.digest();
      for (let i = 0; i + 3 < digest.length && filled < this.dim; i += 4) {
        const v = digest.readUInt32BE(i);
        // map to [-1,1]
        vec[filled++] = (v / 0xffffffff) * 2 - 1;
      }
      counter++;
    }

    const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
    return vec.map((v) => v / norm);
  }
}

const embeddingService = new EmbeddingService();
export default embeddingService;
