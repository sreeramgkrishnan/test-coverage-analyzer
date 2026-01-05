import { MongoClient, Document, Filter } from 'mongodb';
import { mongo, config } from '../utils/config';
import { logger } from '../utils/logger';

type Doc = Document & { embedding?: number[]; metadata?: Record<string, any> };

class VectorSearchService {
  private client?: MongoClient;
  private dbName = mongo.dbName;
  private collectionName = mongo.vectorIndex || mongo.collection;
  private fallbackCollection = mongo.collection;
  private dim = config.embeddingDim;

  private async connect() {
    if (!this.client) {
      this.client = new MongoClient(mongo.uri, { maxPoolSize: 10 });
      await this.client.connect();
    }
    return this.client.db(this.dbName);
  }

  private cosine(a: number[], b: number[]) {
    let dot = 0; let na = 0; let nb = 0;
    const n = Math.min(a.length, b.length);
    for (let i = 0; i < n; i++) {
      const va = a[i] ?? 0; const vb = b[i] ?? 0;
      dot += va * vb; na += va * va; nb += vb * vb;
    }
    const denom = (Math.sqrt(na) || 1) * (Math.sqrt(nb) || 1);
    return dot / denom;
  }

  /**
   * Simple app-side vector search (no MongoDB knn beta).
   * - Fetches a bounded set of candidates, computes cosine similarity, and returns topK.
   */
  async searchByVector(vector: number[], topK = 10, filter: Filter<Doc> = {}) {
    if (!Array.isArray(vector)) throw new Error('vector must be an array');
    const db = await this.connect();
    // try to find collection that actually contains embeddings
    const tryNames = [this.collectionName, this.fallbackCollection];
    let col = db.collection<Doc>(this.collectionName);
    for (const name of tryNames) {
      try {
        const c = db.collection<Doc>(name);
        const count = await c.countDocuments({ embedding: { $exists: true, $ne: [] } });
        logger.info('VectorSearchService collection check', name, 'embCount=', count);
        if (count > 0) {
          col = c;
          break;
        }
      } catch (e: any) {
        logger.warn('VectorSearchService collection probe failed', name, e?.message ?? e);
      }
    }

    const query = { ...filter, embedding: { $exists: true, $ne: [] } };
    const cursor = col.find(query).project({ embedding: 1, metadata: 1 }).limit(10000);
    const docs = await cursor.toArray();

    if (!docs || docs.length === 0) {
      logger.warn('VectorSearchService: no docs with embeddings found in', col.collectionName);
      return [];
    }

    const scored = docs.map((d) => {
      const emb = Array.isArray(d.embedding) ? d.embedding : new Array(this.dim).fill(0);
      const score = this.cosine(emb, vector);
      return { id: d._id, score, metadata: d.metadata ?? null };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
  }
}

export default new VectorSearchService();
