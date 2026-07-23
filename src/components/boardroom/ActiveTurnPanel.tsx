"use client";

import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  CornerDownRight,
} from "lucide-react";
import { AGENT_PERSONAS } from "@/lib/data/agentConfig";
import type { DebateTurn } from "@/lib/types";

interface ActiveTurnPanelProps {
  currentTurn: DebateTurn | null;
  currentRoundNumber: number;
  totalRounds: number;
  currentRoundLabel: string;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSkipBack: () => void;
  onSkipForward: () => void;
  revealedTurns: number;
  totalTurns: number;
}

// ─── Shared timer formatter ───────────────────────────────────────────
export function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

// ─── Main Transcript Panel ────────────────────────────────────────────
export function ActiveTurnPanel({
  currentTurn,
  currentRoundNumber,
  totalRounds,
  currentRoundLabel,
  isPlaying,
  onTogglePlay,
  onSkipBack,
  onSkipForward,
  revealedTurns,
  totalTurns,
}: ActiveTurnPanelProps) {
  const progressPct = totalTurns > 0 ? (revealedTurns / totalTurns) * 100 : 0;
  const agentConfig = currentTurn ? AGENT_PERSONAS[currentTurn.agent] : null;

  // Stance badge config
  const stanceStyle = currentTurn?.stance
    ? currentTurn.stance === "support"
      ? { color: "#16A34A", bg: "rgba(22,163,74,0.1)", label: "SUPPORT" }
      : currentTurn.stance === "oppose"
      ? { color: "#DC2626", bg: "rgba(220,38,38,0.1)", label: "OPPOSE" }
      : { color: "#6B7280", bg: "rgba(107,114,128,0.1)", label: "NEUTRAL" }
    : null;

  return (
    <div className="card p-5 space-y-4">
      {/* Row 1: Round info + Speaking agent header */}
      <div className="flex items-start justify-between">
        {/* Round info */}
        <div>
          <span className="text-[11px] font-bold text-primary">
            Round {currentRoundNumber}
            <span className="text-text-muted font-normal"> of {totalRounds}</span>
          </span>
          <p className="text-sm font-semibold text-text-primary mt-0.5">
            {currentRoundLabel || "—"}
          </p>
        </div>

        {/* Speaking agent identity */}
        {agentConfig && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[10px] text-text-secondary">Now Speaking</p>
              <p className="text-xs font-bold text-text-primary">{agentConfig.name}</p>
              <p className="text-[9px] text-text-muted">{agentConfig.title}</p>
            </div>
            <div
              className="w-12 h-12 rounded-full bg-cover bg-center shadow-sm ring-[2.5px] ring-green-500 ring-offset-2 flex-shrink-0"
              style={{
                backgroundImage: `url('${agentConfig.avatarUrl}')`,
                backgroundColor: "#f0f0f0",
              }}
            />
          </div>
        )}
      </div>

      {/* ── TRANSCRIPT BUBBLE ── */}
      <div
        className="rounded-xl p-5 border min-h-[140px] transition-all"
        style={{
          backgroundColor: agentConfig ? `${agentConfig.color}08` : "#F9FAFB",
          borderColor: agentConfig ? `${agentConfig.color}20` : "#E5E7EB",
          borderLeftWidth: "4px",
          borderLeftColor: agentConfig?.color || "#E5E7EB",
        }}
      >
        {/* Responding to tag */}
        {currentTurn?.respondingTo && (
          <div className="flex items-center gap-1 mb-2 text-[10px] text-text-secondary">
            <CornerDownRight size={11} />
            <span>
              Responding to{" "}
              <span className="font-bold text-text-primary">
                {AGENT_PERSONAS[currentTurn.respondingTo]?.name ||
                  currentTurn.respondingTo}
              </span>
            </span>
          </div>
        )}

        {/* Stance badge */}
        {stanceStyle && (
          <div className="flex items-center gap-2 mb-3">
            <span
              className="text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
              style={{ backgroundColor: stanceStyle.bg, color: stanceStyle.color }}
            >
              {stanceStyle.label}
            </span>
            {/* Waveform animation indicator */}
            {isPlaying && (
              <div className="flex items-center gap-[2px] h-3">
                {[40, 80, 50, 90, 60].map((h, i) => (
                  <span
                    key={i}
                    className="w-[2.5px] bg-green-500 rounded-full"
                    style={{
                      height: `${h}%`,
                      animation: `transcript-wave 0.9s ease-in-out infinite ${i * 0.12}s`,
                    }}
                  />
                ))}
                <style jsx>{`
                  @keyframes transcript-wave {
                    0%, 100% { opacity: 0.5; transform: scaleY(0.6); }
                    50% { opacity: 1; transform: scaleY(1); }
                  }
                `}</style>
              </div>
            )}
          </div>
        )}

        {/* Message text */}
        <p className="text-sm text-text-primary leading-relaxed">
          {currentTurn?.message || (
            <span className="text-text-muted italic text-sm">
              Waiting for the debate to begin. Press play to start.
            </span>
          )}
        </p>
      </div>

      {/* Row 3: Progress bar + Controls */}
      <div className="space-y-3 pt-1">
        {/* Progress bar */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-text-secondary tabular-nums w-10 text-right">
            {formatTimer((revealedTurns / Math.max(totalTurns, 1)) * 45)}
          </span>
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span className="text-[10px] font-mono text-text-secondary tabular-nums w-10">
            {formatTimer(45)}
          </span>
        </div>

        {/* Playback controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={onSkipBack}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-text-muted hover:text-text-primary"
            title="Previous turn"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={onTogglePlay}
            className="w-10 h-10 rounded-full bg-[#0018A8] hover:bg-[#0012A8] flex items-center justify-center transition-all shadow-md hover:shadow-lg active:scale-95"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause size={17} className="text-white fill-white" />
            ) : (
              <Play size={17} className="text-white fill-white ml-0.5" />
            )}
          </button>
          <button
            onClick={onSkipForward}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-text-muted hover:text-text-primary"
            title="Next turn"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
