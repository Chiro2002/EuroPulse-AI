"use client";

import { motion } from "framer-motion";
import { Volume2, MicOff } from "lucide-react";
import { AGENT_PERSONAS, type AgentId } from "@/lib/data/agentConfig";

interface AgentVideoGridProps {
  currentSpeakerId: string | null;
}

// ─── Single Agent Tile (small, vertical) ──────────────────────────────
function AgentTile({
  agentId,
  isSpeaking,
}: {
  agentId: string;
  isSpeaking: boolean;
}) {
  const config = AGENT_PERSONAS[agentId];

  return (
    <motion.div
      layout
      className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl transition-all duration-300 cursor-pointer ${
        isSpeaking
          ? "bg-primary/5 ring-1 ring-primary/20"
          : "hover:bg-gray-50"
      }`}
    >
      {/* Avatar with speaking indicator */}
      <div className="relative">
        <div
          className={`w-12 h-12 rounded-full bg-cover bg-center shadow-sm transition-all duration-300 ${
            isSpeaking
              ? "ring-[2.5px] ring-[#16A34A] ring-offset-[2px] shadow-green-500/20"
              : "ring-[1px] ring-gray-200"
          }`}
          style={{
            backgroundImage: `url('${config.avatarUrl}')`,
            backgroundColor: "#f0f0f0",
          }}
        />
        {/* Status icon */}
        <div className="absolute -bottom-0.5 -right-0.5">
          {isSpeaking ? (
            <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center shadow-sm">
              <div className="flex items-end gap-[1.5px] h-2">
                <span className="w-[2px] bg-white rounded-full" style={{ height: "50%", animation: "waveform-sm 0.8s ease-in-out infinite" }} />
                <span className="w-[2px] bg-white rounded-full" style={{ height: "100%", animation: "waveform-sm 0.6s ease-in-out infinite 0.15s" }} />
                <span className="w-[2px] bg-white rounded-full" style={{ height: "70%", animation: "waveform-sm 0.7s ease-in-out infinite 0.3s" }} />
              </div>
              <style jsx>{`
                @keyframes waveform-sm {
                  0%, 100% { transform: scaleY(0.5); }
                  50% { transform: scaleY(1); }
                }
              `}</style>
            </div>
          ) : (
            <div className="w-3.5 h-3.5 rounded-full bg-gray-400 flex items-center justify-center shadow-sm">
              <MicOff size={6} className="text-white" />
            </div>
          )}
        </div>
      </div>

      {/* Name */}
      <span
        className={`text-[9px] font-bold text-center leading-tight max-w-[68px] truncate ${
          isSpeaking ? "text-primary" : "text-text-secondary"
        }`}
      >
        {config.name.split(" ")[0]}
      </span>
      <span className="text-[7px] text-text-muted text-center leading-tight max-w-[68px] truncate">
        {config.title.split(" ").slice(0, 2).join(" ")}
      </span>
    </motion.div>
  );
}

// ─── Vertical Agent List ──────────────────────────────────────────────
export function AgentVideoGrid({ currentSpeakerId }: AgentVideoGridProps) {
  return (
    <div className="flex flex-col gap-1">
      {(Object.keys(AGENT_PERSONAS) as AgentId[]).map((agentId) => (
        <AgentTile
          key={agentId}
          agentId={agentId}
          isSpeaking={currentSpeakerId === agentId}
        />
      ))}
    </div>
  );
}
