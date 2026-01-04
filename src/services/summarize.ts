import { summarizeConfig } from '../utils/summarizeConfig';

export type SummarizeOptions = {
  query?: string;
  model?: string;
  useLLM?: boolean;
  maxItems?: number;
};

export async function summarizeItems(items: any[], opts: SummarizeOptions = {}) {
  const maxItems = opts.maxItems ?? summarizeConfig.defaultMaxItems;
  const selected = Array.isArray(items) ? items.slice(0, maxItems) : [];

  if (opts.useLLM) {
    try {
      // lazy require to avoid circular imports
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const llm = require('./llmOrchestrator') as any;
      if (llm && typeof llm.summarize === 'function') {
        const out = await llm.summarize({ query: opts.query, items: selected, model: opts.model ?? summarizeConfig.defaultModel });
        return { summary: out, sourceCount: selected.length };
      }
    } catch {
      // fall through to fallback
    }
  }

  const texts = selected.map((i: any) => i.text || i.metadata?.text || JSON.stringify(i || '')).join('\n\n');
  const sentences = texts.match(/[^.!?]+[.!?]+/g) || [texts];
  let summary = sentences.slice(0, 3).join(' ').trim();
  if (summary.length > summarizeConfig.fallbackMaxChars) {
    summary = summary.slice(0, summarizeConfig.fallbackMaxChars).trim() + '...';
  }
  return { summary, sourceCount: selected.length };
}

export default summarizeItems;
