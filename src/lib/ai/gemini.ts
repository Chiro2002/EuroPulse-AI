/**
 * @deprecated Use ./provider instead. This file re-exports the unified provider.
 * 
 * The unified provider supports both Vertex AI (Gemini) and Groq with automatic fallback.
 * Priority: Vertex AI → Groq → None (mock data)
 */
export {
  generateStructuredResponse,
  isAIAvailable,
  getActiveProvider,
} from "./provider";
export type { AIProvider } from "./provider";
