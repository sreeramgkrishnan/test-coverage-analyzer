import { logger } from '../utils/logger';
import { llmConfig } from '../utils/llmConfig';

/**
 * Call GROQ API for LLM inference
 */
async function callGroqAPI(prompt: string, model?: string): Promise<string> {
  const apiKey = llmConfig.groqApiKey;
  if (!apiKey) throw new Error('GROQ_API_KEY not configured');

  const targetModel = model || llmConfig.groqModel;
  const url = 'https://api.groq.com/openai/v1/chat/completions';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: targetModel,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: llmConfig.maxTokens,
      temperature: llmConfig.temperature,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`GROQ API error: ${response.status} ${errText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

/**
 * Perform gap analysis using LLM
 */
export async function gapAnalysis(params: {
  deterministicResults?: any;
  vectorResults?: any;
  hybridResults?: any;
  model?: string;
}) {
  try {
    const { deterministicResults, vectorResults, hybridResults, model } = params;

    // Build context from search results
    const detCount = deterministicResults?.items?.length || 0;
    const vecCount = vectorResults?.items?.length || 0;
    const hybCount = hybridResults?.items?.length || 0;

    const prompt = `You are an expert test coverage analyst. Analyze the following test scenario search results and identify gaps in coverage:

Deterministic Search Results: ${detCount} scenarios found
Vector Search Results: ${vecCount} scenarios found
Hybrid Search Results: ${hybCount} scenarios found

Based on these results, provide:
1. Key coverage gaps identified
2. Risk areas that need more test scenarios
3. Recommendations for improving test coverage

Keep your response concise (under 300 words).`;

    const llmResponse = await callGroqAPI(prompt, model);

    return {
      success: true,
      analysis: llmResponse,
      metadata: {
        deterministicCount: detCount,
        vectorCount: vecCount,
        hybridCount: hybCount,
        model: model || llmConfig.groqModel,
      },
    };
  } catch (e: any) {
    logger.error('LLM gap analysis failed', e.message || e);
    throw new Error(`LLM gap analysis failed: ${e.message || 'unknown error'}`);
  }
}

export const summarizeForLLM = async (coverageSummary: any) => {
  try {
    const total = coverageSummary.scenarios?.length ?? 0;
    const avg = total === 0 ? 0 : coverageSummary.scenarios.reduce((s:any,o:any)=>s+ (o.coverage ?? 0),0)/total;
    return { text: `Feature ${coverageSummary.featureId} average coverage ${(avg*100).toFixed(1)}%`, avg };
  } catch (e:any) {
    logger.error('LLM summarization failed', e.message || e);
    throw new Error('LLM failure');
  }
}

export const generateMissingScenarios = async (featureSummary: any) => {
  const suggestions: string[] = [];
  for (const s of featureSummary.scenarios || []) {
    if ((s.coverage ?? 0) < 0.5) {
      suggestions.push(`Add scenario to cover remaining steps for ${s.scenarioId}`);
    }
  }
  return { suggestions };
}