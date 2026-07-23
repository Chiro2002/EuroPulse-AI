import { NextRequest, NextResponse } from "next/server";
import { ai } from "@/lib/vertex-ai";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = (body?.message || "").trim();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: message,
    });

    return NextResponse.json({
      text: response.text ?? "",
      model: "gemini-2.5-flash",
    });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      {
        error: "AI request failed",
        details: process.env.NODE_ENV === "development" ? error?.message : undefined,
      },
      { status: 500 }
    );
  }
}

/** Simple GET health-check endpoint */
export async function GET() {
  return NextResponse.json({
    status: "ready",
    message: "Send a POST with { message: 'your prompt' } to chat with Gemini",
  });
}
