import crypto from 'crypto';

export type EmbeddingResult = {
  input: string;
  embedding: number[];
  model: string;
};

const DEFAULT_DIM = parseInt(process.env.EMBEDDING_DIM || '1024', 10);
const DEFAULT_MODEL = process.env.EMBEDDING_MODEL || 'mistral-embed';

/**
 * Generate a deterministic embedding for a single input string.
 * Enforces single-input usage as requested.
 */
export async function generateEmbedding(
  input: string,
  model = DEFAULT_MODEL
): Promise<EmbeddingResult> {
  const dim = DEFAULT_DIM;
  const vec: number[] = new Array(dim);

  for (let i = 0; i < dim; i++) {
    const h = crypto.createHash('sha256').update(`${model}::${input}::${i}`).digest();
    const v = ((h.readUInt32BE(0) / 0xffffffff) * 2) - 1;
    vec[i] = v;
  }

  const norm = Math.sqrt(vec.reduce((s, x) => s + x * x, 0)) || 1;
  for (let i = 0; i < dim; i++) vec[i] = vec[i] / norm;

  return { input, embedding: vec, model };
}

export default generateEmbedding;
