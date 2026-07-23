"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gavel,
  Users,
  Sparkles,
  Shield,
  TrendingUp,
  BarChart3,
  Scale,
  Flame,
  CheckCircle,
  RotateCcw,
  Play,
  AlertTriangle,
  Loader2,
  ChevronDown,
} from "lucide-react";
import type { BoardroomDebate, DebateTurn, DebateConclusion } from "@/lib/types";
import { AGENT_CONFIG } from "@/lib/types";

// ─── Agent icons mapping ──────────────────────────────────────────────
const agentIcons: Record<string, any> = {
  cro: Shield,
  trader: TrendingUp,
  economist: BarChart3,
  compliance: Scale,
  devils_advocate: Flame,
  chair: CheckCircle,
};

// ─── Stance colors ────────────────────────────────────────────────────
const stanceConfig = {
  support: { color: "#16A34A", bg: "rgba(22,163,74,0.12)", label: "Support" },
  oppose: { color: "#DC2626", bg: "rgba(220,38,38,0.12)", label: "Oppose" },
  neutral: { color: "#6B7280", bg: "rgba(107,114,128,0.12)", label: "Neutral" },
};

// ─── Typing indicator dots ────────────────────────────────────────────
function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: "0ms" }} />
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: "150ms" }} />
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: "300ms" }} />
    </span>
  );
}

// ─── Agent Avatar ─────────────────────────────────────────────────────
function AgentAvatar({ agentId, size = "md" }: { agentId: string; size?: "sm" | "md" | "lg" }) {
  const config = AGENT_CONFIG[agentId];
  const Icon = agentIcons[agentId] || Users;
  const sizeClasses = size === "sm" ? "w-6 h-6" : size === "lg" ? "w-10 h-10" : "w-8 h-8";
  const iconSize = size === "sm" ? 10 : size === "lg" ? 16 : 13;

  return (
    <div
      className={`${sizeClasses} rounded-full flex items-center justify-center flex-shrink-0 shadow-sm`}
      style={{ backgroundColor: config.bgColor, color: config.color }}
    >
      <Icon size={iconSize} />
    </div>
  );
}

// ─── Agent Roster Strip ──────────────────────────────────────────────
function AgentRoster() {
  const agents = Object.entries(AGENT_CONFIG);
  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
      {agents.map(([id, config]) => (
        <div key={id} className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white border border-gray-100 shadow-sm">
          <AgentAvatar agentId={id} size="lg" />
          <span className="text-[9px] font-semibold text-text-primary text-center leading-tight">{config.name}</span>
          <span className="text-[7px] text-text-secondary text-center leading-tight">{config.role}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Round Divider ────────────────────────────────────────────────────
function RoundDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-gray-200" />
      <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-gray-200 whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────
function MessageBubble({
  turn,
  agentConfig,
  isDevilsAdvocateChallenge,
}: {
  turn: DebateTurn;
  agentConfig: typeof AGENT_CONFIG[string];
  isDevilsAdvocateChallenge?: boolean;
}) {
  const Icon = agentIcons[turn.agent] || Users;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-start gap-3 ${isDevilsAdvocateChallenge ? "mt-5" : "mt-2"}`}
    >
      <AgentAvatar agentId={turn.agent} />
      <div className="flex-1 min-w-0">
        {/* Header row: name + role + stance */}
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-xs font-bold text-text-primary">{agentConfig.name}</span>
          <span className="text-[9px] text-text-secondary">{agentConfig.role}</span>
          {turn.stance && (
            <span
              className="text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider"
              style={{ backgroundColor: stanceConfig[turn.stance].bg, color: stanceConfig[turn.stance].color }}
            >
              {stanceConfig[turn.stance].label}
            </span>
          )}
          {turn.respondingTo && (
            <span className="text-[9px] text-text-secondary/60 flex items-center gap-0.5">
              <ChevronDown size={9} className="rotate-90" />
              responding to {AGENT_CONFIG[turn.respondingTo]?.name || turn.respondingTo}
            </span>
          )}
        </div>

        {/* Message card */}
        <div
          className={`rounded-xl p-3 shadow-sm ${
            isDevilsAdvocateChallenge
              ? "bg-amber-50/80 border border-dashed border-amber-300"
              : "bg-white border border-gray-100"
          }`}
          style={{ borderLeftWidth: "3px", borderLeftColor: agentConfig.color }}
        >
          <p className="text-xs text-text-primary leading-relaxed">{turn.message}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Verdict Card ─────────────────────────────────────────────────────
function VerdictCard({ conclusion }: { conclusion: DebateConclusion }) {
  const confidenceColor = conclusion.confidenceScore >= 70 ? "#16A34A" : conclusion.confidenceScore >= 40 ? "#F5A623" : "#DC2626";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", damping: 20, stiffness: 200 }}
      className="mt-6"
    >
      <div className="card p-5 overflow-hidden relative">
        {/* Top accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent" />

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Gavel size={18} className="text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-text-primary">Committee Decision</h2>
            <p className="text-[10px] text-text-secondary">Chaired by {AGENT_CONFIG.chair.name}</p>
          </div>
        </div>

        {/* Final Decision */}
        <p className="text-sm font-semibold text-text-primary leading-relaxed mb-4 bg-gray-50 rounded-xl p-3 border border-gray-100">
          {conclusion.finalDecision}
        </p>

        {/* Confidence Score + Votes side by side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {/* Confidence meter */}
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
            <p className="text-[9px] font-semibold text-text-secondary uppercase tracking-wider mb-2">Confidence Score</p>
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 flex-shrink-0">
                <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="#E5E7EB" strokeWidth="2.5" />
                  <circle
                    cx="18" cy="18" r="15.5"
                    fill="none"
                    stroke={confidenceColor}
                    strokeWidth="2.5"
                    strokeDasharray={`${(conclusion.confidenceScore / 100) * 97.4} 97.4`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold" style={{ color: confidenceColor }}>
                  {conclusion.confidenceScore}
                </span>
              </div>
              <div className="flex-1">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${conclusion.confidenceScore}%`, backgroundColor: confidenceColor }}
                  />
                </div>
                <p className="text-[9px] text-text-secondary mt-1">
                  {conclusion.confidenceScore >= 70 ? "Strong consensus" : conclusion.confidenceScore >= 40 ? "Moderate agreement" : "Divided committee"}
                </p>
              </div>
            </div>
          </div>

          {/* Vote Tally */}
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
            <p className="text-[9px] font-semibold text-text-secondary uppercase tracking-wider mb-2">Vote Tally</p>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(conclusion.votes).map(([agentId, vote]) => (
                <div
                  key={agentId}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-medium"
                  style={{ backgroundColor: stanceConfig[vote].bg, color: stanceConfig[vote].color }}
                >
                  <span>{AGENT_CONFIG[agentId]?.name.split(" ")[0]}</span>
                  <span className="font-bold">{vote === "support" ? "✓" : vote === "oppose" ? "✗" : "–"}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reasoning Summary */}
        <div className="mb-3 p-3 rounded-xl bg-white border border-gray-100">
          <p className="text-[9px] font-semibold text-text-secondary uppercase tracking-wider mb-1">Reasoning</p>
          <p className="text-xs text-text-primary leading-relaxed">{conclusion.reasoningSummary}</p>
        </div>

        {/* Dissenting View */}
        <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200">
          <div className="flex items-center gap-1.5 mb-1">
            <AlertTriangle size={11} className="text-amber-600" />
            <span className="text-[9px] font-bold text-amber-700 uppercase tracking-wider">Dissenting View</span>
          </div>
          <p className="text-xs text-amber-900/90 leading-relaxed">{conclusion.dissentingView}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────
export default function BoardroomPage() {
  const searchParams = useSearchParams();
  const [topic, setTopic] = useState(searchParams.get("topic") || "");
  const [debate, setDebate] = useState<BoardroomDebate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autoStartedRef = useRef(false);

  // Playback state
  const [playbackIndex, setPlaybackIndex] = useState(-1);
  const [revealedTurns, setRevealedTurns] = useState<number>(0);
  const [showTyping, setShowTyping] = useState(false);
  const [showVerdict, setShowVerdict] = useState(false);
  const [finished, setFinished] = useState(false);
  const transcriptRef = useRef<HTMLDivElement>(null);

  type QueueItem = { type: "round_divider"; label: string } | { type: "turn"; turn: DebateTurn };
  // Flatten all turns + round dividers into a sequential array
  const [playbackQueue, setPlaybackQueue] = useState<QueueItem[]>([]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [revealedTurns, showTyping, showVerdict]);

  // Build playback queue when debate loads
  useEffect(() => {
    if (!debate) return;
    const queue: QueueItem[] = [];
    debate.rounds.forEach((round) => {
      queue.push({ type: "round_divider", label: `Round ${round.roundNumber} — ${round.roundLabel}` });
      round.turns.forEach((turn) => {
        queue.push({ type: "turn", turn });
      });
    });
    setPlaybackQueue(queue);
    setPlaybackIndex(0);
    setRevealedTurns(0);
    setShowVerdict(false);
    setFinished(false);
  }, [debate]);

  // Playback engine: reveal one item at a time
  useEffect(() => {
    if (playbackIndex < 0 || playbackIndex >= playbackQueue.length) {
      if (playbackIndex >= playbackQueue.length && playbackQueue.length > 0) {
        // All turns revealed, show verdict after a short delay
        const timer = setTimeout(() => {
          setShowVerdict(true);
          setFinished(true);
        }, 800);
        return () => clearTimeout(timer);
      }
      return;
    }

    const item = playbackQueue[playbackIndex];
    if (!item) return;

    if (item.type === "turn") {
      setShowTyping(true);
      const msgLen = item.turn.message.length;
      const typingDelay = Math.min(1500, 600 + msgLen * 12);
      const revealTimer = setTimeout(() => {
        setShowTyping(false);
        setRevealedTurns((prev) => prev + 1);
        const pauseDelay = Math.min(800, 300 + msgLen * 5);
        setTimeout(() => {
          setPlaybackIndex((prev) => prev + 1);
        }, pauseDelay);
      }, typingDelay);
      return () => clearTimeout(revealTimer);
    } else {
      // Round divider - show immediately, move to next
      setRevealedTurns((prev) => prev + 1);
      const timer = setTimeout(() => {
        setPlaybackIndex((prev) => prev + 1);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [playbackIndex, playbackQueue]);

  // Reveal queue items as they become "ready"
  const revealedItems = playbackQueue.slice(0, revealedTurns);

  // Auto-start debate if topic was passed via query param
  useEffect(() => {
    if (topic.trim() && !autoStartedRef.current && !debate && !loading) {
      autoStartedRef.current = true;
      startDebate();
    }
  }, [topic]);

  const startDebate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError(null);
    setDebate(null);
    setPlaybackIndex(-1);
    setRevealedTurns(0);
    setShowVerdict(false);
    setFinished(false);

    try {
      const res = await fetch("/api/boardroom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim() }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to generate debate");
      }
      const data = await res.json();
      setDebate(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const replay = () => {
    setPlaybackIndex(0);
    setRevealedTurns(0);
    setShowTyping(false);
    setShowVerdict(false);
    setFinished(false);
  };

  const reset = () => {
    setDebate(null);
    setTopic("");
    setPlaybackIndex(-1);
    setRevealedTurns(0);
    setShowVerdict(false);
    setFinished(false);
    setError(null);
    autoStartedRef.current = false;
    window.history.replaceState({}, "", "/boardroom");
  };



  return (
    <div className="p-4 sm:p-6 space-y-5 animate-fade-in max-w-4xl mx-auto">
      {/* ── Page Header ── */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-sm">
          <Gavel size={16} className="text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-text-primary">AI Boardroom</h1>
          <p className="text-xs text-text-secondary">Multi-Agent Committee Debate Simulator</p>
        </div>
      </div>

      {/* ── Topic Input (shown before debate starts) ── */}
      {!debate && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <Users size={14} className="text-primary" />
            <h2 className="text-sm font-bold text-text-primary">Committee Debate Simulator</h2>
          </div>
          <p className="text-xs text-text-secondary mb-4 leading-relaxed">
            Watch Deutsche Bank&apos;s investment committee debate this decision live. Six AI agents — CRO, Trader, Economist, Compliance Officer, Devil&apos;s Advocate, and Chair — will argue, cross-examine, and reach a verdict.
          </p>

          {/* Pre-built suggestions */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {[
              "Should DB reduce Italy exposure by 15%?",
              "Should DB increase German corporate lending by €2B?",
              "Should DB increase energy sector hedging to 80%?",
              "Should DB extend bond portfolio duration by 0.5 years?",
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setTopic(suggestion)}
                className="px-2.5 py-1 rounded-lg bg-gray-50 border border-border text-[10px] text-text-secondary hover:text-primary hover:border-primary/30 transition-all"
              >
                {suggestion.length > 40 ? suggestion.slice(0, 40) + "…" : suggestion}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && startDebate()}
              placeholder='e.g. "Should DB reduce Italy exposure by 15%?"'
              className="flex-1 bg-gray-50 border border-border rounded-xl px-4 h-12 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/40 transition-colors"
              disabled={loading}
              maxLength={200}
            />
            <button
              onClick={startDebate}
              disabled={loading || !topic.trim()}
              className="flex items-center justify-center gap-2 px-6 h-12 rounded-xl bg-primary text-white text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Convening committee...
                </>
              ) : (
                <>
                  <Gavel size={16} />
                  Start Debate
                </>
              )}
            </button>
          </div>

          {/* Error toast */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2"
              >
                <AlertTriangle size={14} className="text-red-500 flex-shrink-0" />
                <span className="text-xs text-red-700">{error}</span>
                <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600 text-xs font-medium">Dismiss</button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ── Loading State ── */}
      {loading && (
        <div className="card p-8 flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <div className="text-center">
            <p className="text-sm font-semibold text-text-primary">Convening the committee...</p>
            <p className="text-xs text-text-secondary mt-1">The CRO, Trader, Economist, Compliance, and Devil&apos;s Advocate are taking their seats</p>
          </div>
        </div>
      )}

      {/* ── Debate Area ── */}
      {debate && (
        <div className="space-y-4">
          {/* Topic Banner */}
          <div className="card p-3 bg-primary/[0.02] border-primary/10">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-primary flex-shrink-0" />
              <p className="text-xs font-medium text-text-primary">
                Debate Topic: <span className="font-bold">{debate.topic}</span>
              </p>
            </div>
          </div>

          {/* Agent Roster */}
          <AgentRoster />

          {/* Live Transcript */}
          <div
            ref={transcriptRef}
            className="card p-4 space-y-1 max-h-[60vh] overflow-y-auto scrollbar-thin"
          >
            {revealedItems.map((item, i) => {
              if (item.type === "round_divider") {
                return <RoundDivider key={`divider-${i}`} label={item.label} />;
              }
              const turn = item.turn;
              const config = AGENT_CONFIG[turn.agent];
              const isDevilsChallenge = turn.agent === "devils_advocate" && turn.challenging;
              return (
                <MessageBubble
                  key={`turn-${i}`}
                  turn={turn}
                  agentConfig={config}
                  isDevilsAdvocateChallenge={!!isDevilsChallenge}
                />
              );
            })}

            {/* Typing indicator */}
            {showTyping && playbackIndex >= 0 && playbackIndex < playbackQueue.length && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3 mt-2"
              >
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="text-[9px] font-bold text-text-secondary">...</span>
                </div>
                <div className="text-xs text-text-secondary flex items-center gap-1.5">
                  <span className="font-medium">
                    {(() => {
                      const item = playbackQueue[playbackIndex];
                      if (item.type === "turn") {
                        return AGENT_CONFIG[item.turn.agent]?.name || item.turn.agent;
                      }
                      return "";
                    })()}
                  </span>
                  is typing
                  <TypingDots />
                </div>
              </motion.div>
            )}

            {/* Bottom padding for smooth scroll */}
            <div className="h-4" />
          </div>

          {/* Verdict Card */}
          {showVerdict && debate.conclusion && (
            <VerdictCard conclusion={debate.conclusion} />
          )}

          {/* Controls */}
          <div className="flex items-center gap-2">
            {finished && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={replay}
                className="flex items-center gap-1.5 px-4 h-9 rounded-xl bg-gray-100 text-text-secondary text-xs font-medium hover:text-text-primary hover:bg-gray-200 transition-all"
              >
                <RotateCcw size={13} />
                Replay Debate
              </motion.button>
            )}
            <button
              onClick={reset}
              className="flex items-center gap-1.5 px-4 h-9 rounded-xl bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-all"
            >
              <Play size={13} />
              New Debate
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
