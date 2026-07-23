/**
 * Unified AI Provider — supports Vertex AI (Gemini) and Groq
 * 
 * Priority: Vertex AI → Groq → None (fallback to mock data)
 * 
 * Env vars:
 *   GOOGLE_CLOUD_PROJECT + GOOGLE_CLOUD_LOCATION → Vertex AI (Gemini) via @google/genai
 *   GCP_PROJECT_ID + GCP_LOCATION               → (legacy, also supported)
 *   GROQ_API_KEY                                → Groq (Llama 3 / Mixtral)
 */

import { GoogleGenAI } from "@google/genai";

// ─── Provider Detection ────────────────────────────────────────────────

export type AIProvider = "vertex" | "groq" | "none";

export function getActiveProvider(): AIProvider {
  if (
    (process.env.GCP_PROJECT_ID && process.env.GCP_LOCATION) ||
    (process.env.GOOGLE_CLOUD_PROJECT && process.env.GOOGLE_CLOUD_LOCATION)
  ) {
    return "vertex";
  }
  if (process.env.GROQ_API_KEY) return "groq";
  return "none";
}

export function isAIAvailable(): boolean {
  return getActiveProvider() !== "none";
}

// ─── Vertex AI (Gemini) via @google/genai ──────────────────────────────

let vertexAi: GoogleGenAI | null = null;

function getVertexClient(): GoogleGenAI {
  if (!vertexAi) {
    // @google/genai reads GOOGLE_CLOUD_PROJECT, GOOGLE_CLOUD_LOCATION,
    // and GOOGLE_GENAI_USE_ENTERPRISE from the environment automatically.
    vertexAi = new GoogleGenAI({});
  }
  return vertexAi;
}

// ─── Options ──────────────────────────────────────────────────────────

export interface GenerateOptions {
  maxTokens?: number;
  temperature?: number;
}

// ─── Vertex AI (Gemini) via @google/genai ──────────────────────────────

async function callVertex(
  system: string,
  user: string,
  schema: Record<string, any>,
  options?: GenerateOptions
): Promise<string | null> {
  try {
    const ai = getVertexClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: user,
      config: {
        systemInstruction: `${system}\n\nRespond with valid JSON matching this schema: ${JSON.stringify(schema)}`,
        temperature: options?.temperature ?? 0.1,
        maxOutputTokens: options?.maxTokens ?? 1024,
      },
    });
    return response.text ?? null;
  } catch (e) {
    console.warn("Vertex API error:", e);
    return null;
  }
}

// ─── Groq ──────────────────────────────────────────────────────────────

let groqClient: any = null;

async function getGroqClient() {
  if (groqClient) return groqClient;
  try {
    const { default: Groq } = await import("groq-sdk");
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
    return groqClient;
  } catch (e) {
    console.warn("Groq init failed:", e);
    return null;
  }
}

async function callGroq(
  system: string,
  user: string,
  schema: Record<string, any>,
  options?: GenerateOptions
): Promise<string | null> {
  const client = await getGroqClient();
  if (!client) return null;
  try {
    const result = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: `${system}\n\nRespond with valid JSON matching: ${JSON.stringify(schema)}` },
        { role: "user", content: user },
      ],
      temperature: options?.temperature ?? 0.1,
      max_tokens: options?.maxTokens ?? 1024,
    });
    return result.choices?.[0]?.message?.content ?? null;
  } catch (e) {
    console.warn("Groq API error:", e);
    return null;
  }
}

// ─── Public API ────────────────────────────────────────────────────────

/**
 * Send a prompt to the active AI provider and get structured JSON output.
 * Falls back through: Vertex AI → Groq → null
 * 
 * @param options Optional - maxTokens and temperature to override defaults
 */
export async function generateStructuredResponse<T>(
  systemPrompt: string,
  userPrompt: string,
  schema: Record<string, any>,
  options?: GenerateOptions
): Promise<T | null> {
  const provider = getActiveProvider();
  
  let raw: string | null = null;
  
  if (provider === "vertex") {
    raw = await callVertex(systemPrompt, userPrompt, schema, options);
  } else if (provider === "groq") {
    raw = await callGroq(systemPrompt, userPrompt, schema, options);
  } else {
    return null;
  }

  if (!raw) return null;

  // Extract JSON from AI response — handles markdown code fences, extra text, and nested braces
  try {
    // Step 1: Strip all markdown code fence markers (```json, ```, etc.)
    let cleaned = raw
      .replace(/^```(?:json)?\s*\n?/gm, '')  // Opening fence at start of line
      .replace(/\n?```\s*$/gm, '')             // Closing fence at end
      .replace(/```/g, '')                       // Any remaining stray backticks
      .trim();

    // Step 2: Find the outermost JSON object or array
    let jsonStr: string | null = null;
    
    // Try finding a { ... } block first (most common)
    const firstBrace = cleaned.indexOf('{');
    const firstBracket = cleaned.indexOf('[');
    
    if (firstBrace >= 0 && (firstBracket < 0 || firstBrace < firstBracket)) {
      // Object — find the matching closing brace
      let depth = 0;
      let start = firstBrace;
      for (let i = start; i < cleaned.length; i++) {
        if (cleaned[i] === '{') depth++;
        else if (cleaned[i] === '}') {
          depth--;
          if (depth === 0) {
            jsonStr = cleaned.substring(start, i + 1);
            break;
          }
        }
      }
    } else if (firstBracket >= 0) {
      // Array — find the matching closing bracket
      let depth = 0;
      let start = firstBracket;
      for (let i = start; i < cleaned.length; i++) {
        if (cleaned[i] === '[') depth++;
        else if (cleaned[i] === ']') {
          depth--;
          if (depth === 0) {
            jsonStr = cleaned.substring(start, i + 1);
            break;
          }
        }
      }
    }

    // Fallback: try parsing the whole cleaned string
    if (!jsonStr) jsonStr = cleaned;

    return JSON.parse(jsonStr) as T;
  } catch (e) {
    console.warn("Failed to parse AI response as JSON:", e);
    console.warn("Raw response was:", raw);
    return null;
  }
}
