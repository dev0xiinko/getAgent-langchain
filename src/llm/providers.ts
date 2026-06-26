import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import {
  config,
  OPENROUTER_BASE,
  OR_HEADERS,
  AGENT_MODEL,
  CHAT_PROVIDER,
  MAX_TOKENS,
  KB_EMBED_MODEL,
} from "../config";

/**
 * Chat model, OpenRouter-routed. OpenRouter-specific routing controls
 * (`provider`) ride along via `modelKwargs` — they are not part of the
 * OpenAI schema. No `temperature` is set (preserve the model default).
 */
export function makeChat(opts: { streaming: boolean; model?: string } = { streaming: false }) {
  return new ChatOpenAI({
    apiKey: config.openrouterApiKey,
    model: opts.model ?? AGENT_MODEL,
    maxTokens: MAX_TOKENS,
    streaming: opts.streaming,
    configuration: { baseURL: OPENROUTER_BASE, defaultHeaders: OR_HEADERS },
    modelKwargs: { provider: CHAT_PROVIDER },
  });
}

/**
 * Embeddings, OpenRouter-routed. `OpenAIEmbeddings` has no `modelKwargs`, so the
 * OpenRouter `provider` routing hint can't be passed here — OpenRouter picks a
 * provider for the embedding model on its own. If you need to pin openai/azure,
 * route embeddings through a thin custom fetch wrapper instead.
 */
export const embeddings = new OpenAIEmbeddings({
  apiKey: config.openrouterApiKey,
  model: KB_EMBED_MODEL,
  configuration: { baseURL: OPENROUTER_BASE, defaultHeaders: OR_HEADERS },
});
