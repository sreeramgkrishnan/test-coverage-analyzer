import { MongoClient, ObjectId } from 'mongodb';
import generateEmbedding from './embeddings';
import { vectorConfig } from '../utils/vectorConfig';

let client: MongoClient | null = null;
async function getClient() {
  if (!client) {
    client = new MongoClient(vectorConfig.mongoUri as string, { useNewUrlParser: true, useUnifiedTopology: true } as any);
    await client.connect();
  }
  return client;
}

function cosine(a: number[], b: number[]) {
  const n = Math.min(a.length, b.length);
  let dp = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < n; i++) {
    const ai = a[i] || 0;
    const bi = b[i] || 0;
    dp += ai * bi;
    na += ai * ai;
    nb += bi * bi;
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  if (denom === 0) return 0;
  return dp / denom;
}

export async function indexScenario(id: string, embedding: number[], metadata: any = {}) {
  const c = await getClient();
  const col = c.db(vectorConfig.mongoDbName).collection(vectorConfig.collection);
  await col.updateOne(
    { _id: new ObjectId(id) },
    { $set: { embedding, metadata, updatedAt: new Date() } },
    { upsert: true }
  );
}

export async function searchByEmbedding(queryEmbedding: number[], topK = 5, filter: any = {}) {
  const c = await getClient();
  const col = c.db(vectorConfig.mongoDbName).collection(vectorConfig.collection);

  const cursor = col.find(filter).limit(vectorConfig.maxCandidates);
  const docs = await cursor.toArray();

  const scored = docs
    .map((d: any) => {
      const emb = d.embedding || [];
      const score = cosine(queryEmbedding, emb);
      return { 
        id: d._id, 
        score, 
        text: d.text || d.metadata?.text || '',
        metadata: d.metadata || {},
        document: d
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  return scored;
}

export async function search(queryText: string, topK = 5, filter: any = {}) {
  const qEmb = await generateEmbedding(queryText);
  return searchByEmbedding(qEmb.embedding, topK, filter);
}

export default { indexScenario, search, searchByEmbedding };
