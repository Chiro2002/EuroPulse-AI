/**
 * Unified AI Provider — supports Vertex AI (Gemini) and Groq
 * 
 * Priority: Vertex AI → Groq → None (fallback to mock data)
 * 
 * Env vars:
 *   GCP_PROJECT_ID + GCP_LOCATION → Vertex AI (Gemini)
 *   GROQ_API_KEY                  → Groq (Llama 3 / Mixtral)
 */

// ─── Provider Detection ────────────────────────────────────────────────

export type AIProvider = "vertex" | "groq" | "none";

export function getActiveProvider(): AIProvider {
  if (process.env.GCP_PROJECT_ID && process.env.GCP_LOCATION) return "vertex";
  if (process.env.GROQ_API_KEY) return "groq";
  return "none";
}

export function isAIAvailable(): boolean {
  return getActiveProvider() !== "none";
}

// ─── Vertex AI (Gemini) ────────────────────────────────────────────────

let vertexClient: any = null;

async function getVertexModel() {
  if (vertexClient) return vertexClient;
  try {
    const { VertexAI } = await import("@google-cloud/vertexai");
    const client = new VertexAI({
      project: process.env.GCP_PROJECT_ID!,
      location: process.env.GCP_LOCATION!,
    });
    vertexClient = client.getGenerativeModel({
      model: "gemini-1.5-pro-001",
      generationConfig: { temperature: 0.1, maxOutputTokens: 1024 },
    });
    return vertexClient;
  } catch (e) {
    console.warn("Vertex AI init failed:", e);
    return null;
  }
}

async function callVertex(system: string, user: string, schema: Record<string, any>): Promise<string | null> {
  const model = await getVertexModel();
  if (!model) return null;
  try {
    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts: [{ text: `${system}\n\n${user}\n\nJSON schema: ${JSON.stringify(schema)}` }],
      }],
    });
    return result.response?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
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

async function callGroq(system: string, user: string, schema: Record<string, any>): Promise<string | null> {
  const client = await getGroqClient();
  if (!client) return null;
  try {
    const result = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: `${system}\n\nRespond with valid JSON matching: ${JSON.stringify(schema)}` },
        { role: "user", content: user },
      ],
      temperature: 0.1,
      max_tokens: 1024,
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
 */
export async function generateStructuredResponse<T>(
  systemPrompt: string,
  userPrompt: string,
  schema: Record<string, any>
): Promise<T | null> {
  const provider = getActiveProvider();
  
  let raw: string | null = null;
  
  if (provider === "vertex") {
    raw = await callVertex(systemPrompt, userPrompt, schema);
  } else if (provider === "groq") {
    raw = await callGroq(systemPrompt, userPrompt, schema);
  } else {
    return null;
  }

  if (!raw) return null;

  // Extract JSON from response (handles markdown code blocks)
  try {
    const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/) || raw.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]).trim() : raw.trim();
    return JSON.parse(jsonStr) as T;
  } catch (e) {
    console.warn("Failed to parse AI response as JSON:", e);
    return null;
  }
}
