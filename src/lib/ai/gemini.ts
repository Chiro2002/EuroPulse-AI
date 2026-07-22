/**
 * Vertex AI / Gemini Client Setup
 * 
 * This module configures the Google Cloud Vertex AI client
 * for use with Gemini 1.5 Pro for AI-powered analysis.
 */

// Dynamic import for Vertex AI — only loaded when env vars are configured
let vertexAIClient: any = null;

interface AIConfig {
  projectId: string;
  location: string;
}

function getAIConfig(): AIConfig | null {
  const projectId = process.env.GCP_PROJECT_ID;
  const location = process.env.GCP_LOCATION;

  if (!projectId || !location) {
    return null;
  }

  return { projectId, location };
}

/**
 * Get or initialize the Vertex AI client
 * Returns null if environment variables are not configured
 */
export async function getVertexAIClient() {
  if (vertexAIClient) return vertexAIClient;

  const config = getAIConfig();
  if (!config) return null;

  try {
    const { VertexAI } = await import("@google-cloud/vertexai");
    vertexAIClient = new VertexAI({
      project: config.projectId,
      location: config.location,
    });
    return vertexAIClient;
  } catch (error) {
    console.warn("Failed to initialize Vertex AI client:", error);
    return null;
  }
}

/**
 * Get the GenerativeModel instance
 */
export async function getGenerativeModel() {
  const client = await getVertexAIClient();
  if (!client) return null;

  const model = client.getGenerativeModel({
    model: "gemini-1.5-pro-001",
    generationConfig: {
      temperature: 0.2,
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 2048,
    },
  });

  return model;
}

/**
 * Send a prompt to Gemini and get structured JSON output
 */
export async function generateStructuredResponse<T>(
  systemPrompt: string,
  userPrompt: string,
  schema: Record<string, any>
): Promise<T | null> {
  const model = await getGenerativeModel();
  if (!model) return null;

  try {
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: `${systemPrompt}\n\n${userPrompt}\n\nIMPORTANT: Respond with valid JSON matching this schema: ${JSON.stringify(schema)}` },
          ],
        },
      ],
    });

    const response = result.response;
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    // Extract JSON from the response (handles markdown code blocks)
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || text.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : text;

    return JSON.parse(jsonStr.trim()) as T;
  } catch (error) {
    console.error("Gemini API error:", error);
    return null;
  }
}

/**
 * Check if AI features are available (env vars configured)
 */
export function isAIAvailable(): boolean {
  return !!(process.env.GCP_PROJECT_ID && process.env.GCP_LOCATION);
}
