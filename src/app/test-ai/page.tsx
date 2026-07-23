"use client";

import { useState, useRef, useEffect } from "react";

export default function TestAIPage() {
  const [message, setMessage] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const preRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (preRef.current) {
      preRef.current.scrollTop = preRef.current.scrollHeight;
    }
  }, [answer]);

  async function testConnection() {
    setLoading(true);
    setAnswer("");
    setStatus("testing");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message || "Hello! Please introduce yourself briefly and confirm you're connected to Google Vertex AI.",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAnswer(data.text || "No response text received.");
        setStatus("success");
      } else {
        setAnswer(`Error: ${data.error}${data.details ? `\nDetails: ${data.details}` : ""}`);
        setStatus("error");
      }
    } catch (err: any) {
      setAnswer(`Network error: ${err.message}`);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">🤖 Vertex AI Test</h1>
        <p className="text-gray-400 mb-8">
          Test your Google Vertex AI (Gemini) connection. The AI should respond if credentials are working.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Your message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask Gemini anything..."
              rows={3}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  testConnection();
                }
              }}
            />
          </div>

          <button
            onClick={testConnection}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            {loading ? "Asking Gemini..." : "Send to Gemini"}
          </button>

          {status !== "idle" && (
            <div
              className={`p-4 rounded-lg border ${
                status === "success"
                  ? "bg-green-900/30 border-green-700 text-green-300"
                  : status === "error"
                  ? "bg-red-900/30 border-red-700 text-red-300"
                  : "bg-blue-900/30 border-blue-700 text-blue-300"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    status === "success"
                      ? "bg-green-400"
                      : status === "error"
                      ? "bg-red-400"
                      : "bg-blue-400 animate-pulse"
                  }`}
                />
                <span className="text-sm font-medium">
                  {status === "testing" && "Waiting for Gemini..."}
                  {status === "success" && "✓ Response received"}
                  {status === "error" && "✗ Error"}
                </span>
              </div>
              <pre
                ref={preRef}
                className="text-sm whitespace-pre-wrap font-sans text-gray-200 max-h-96 overflow-y-auto"
              >
                {answer}
              </pre>
            </div>
          )}
        </div>

        <div className="mt-12 border-t border-gray-800 pt-6">
          <h2 className="text-lg font-semibold mb-2">Quick API Test (curl)</h2>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm text-green-400 overflow-x-auto">
            {`curl -X POST http://localhost:3000/api/chat \\
  -H "Content-Type: application/json" \\
  -d '{"message": "Hello from curl!"}'`}
          </pre>
        </div>
      </div>
    </div>
  );
}
