/**
 * Vertex AI (Gemini) Client
 *
 * Uses the new @google/genai SDK for a simpler, modern API.
 * Automatically authenticates via Google ADC credentials
 * located at ~/.config/gcloud/application_default_credentials.json
 *
 * Env vars required:
 *   GOOGLE_CLOUD_PROJECT   — GCP project ID
 *   GOOGLE_CLOUD_LOCATION  — GCP location (default: global)
 *   GOOGLE_GENAI_USE_ENTERPRISE=true — use Vertex AI backend
 */

import { GoogleGenAI } from "@google/genai";

export const ai = new GoogleGenAI({});

/**
 * Send a prompt to Gemini and get the full text response.
 * Uses gemini-2.5-flash for fast, general-purpose chat.
 */
export async function chat(prompt: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });
  return response.text ?? "";
}

/**
 * Send a structured prompt to Gemini with a system instruction.
 * The systemInstruction goes inside the config object.
 */
export async function chatWithSystem(
  systemInstruction: string,
  userPrompt: string
): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: userPrompt,
    config: {
      systemInstruction: systemInstruction,
    },
  });
  return response.text ?? "";
}

/**
 * Send a prompt to Gemini and get a streaming (async-iterable) response.
 * Useful for ChatGPT-like typing experience.
 *
 * Usage:
 *   const stream = chatStream("Hello");
 *   for await (const chunk of stream) {
 *     console.log(chunk.text);
 *   }
 */
export function chatStream(prompt: string) {
  return ai.models.generateContentStream({
    model: "gemini-2.5-flash",
    contents: prompt,
  });
}
