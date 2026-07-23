"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gavel,
  Play,
  Loader2,
  AlertTriangle,
  RotateCcw,
  Bell,
  User,
  ChevronDown,
  Sparkles,
  Info,
  Users,
  TrendingUp,
  Shield,
} from "lucide-react";
import { AGENT_ORDER, AGENT_PERSONAS } from "@/lib/data/agentConfig";
import type { BoardroomDebate, DebateTurn, DebateConclusion } from "@/lib/types";
import { AgentVideoGrid } from "@/components/boardroom/AgentVideoGrid";
import { ActiveTurnPanel, formatTimer } from "@/components/boardroom/ActiveTurnPanel";
import { BottomTabBar, type TabId } from "@/components/boardroom/BottomTabBar";

// ─── Types ────────────────────────────────────────────────────────────
type QueueItem =
  | { type: "round_divider"; label: string }
  | { type: "turn"; turn: DebateTurn };

interface DerivedState {
  currentSpeakerId: string | null;
  currentRoundNumber: number;
  currentRoundLabel: string;
  revealedVotes: Record<string, "support" | "oppose" | "neutral">;
  runningSentimentScore: number;
}

// ─── Compute derived state ────────────────────────────────────────────
function computeDerivedState(
  queue: QueueItem[],
  revealedCount: number
): DerivedState {
  let currentSpeakerId: string | null = null;
  let currentRoundNumber = 1;
  let currentRoundLabel = "";
  const revealedVotes: Record<string, "support" | "oppose" | "neutral"> = {};
  let totalSentiment = 0;
  let sentimentCount = 0;

  for (let i = 0; i < Math.min(revealedCount, queue.length); i++) {
    const item = queue[i];
    if (item.type === "round_divider") {
      const match = item.label.match(/Round (\d+)/);
      if (match) currentRoundNumber = parseInt(match[1]);
      currentRoundLabel = item.label.replace(/^Round \d+ —\s*/, "");
    } else if (item.type === "turn") {
      currentSpeakerId = item.turn.agent;
      if (item.turn.stance) {
        revealedVotes[item.turn.agent] = item.turn.stance;
        const numeric =
          item.turn.stance === "support" ? 1
          : item.turn.stance === "oppose" ? -1
          : 0;
        totalSentiment += numeric;
        sentimentCount++;
      }
    }
  }

  const runningSentimentScore =
    sentimentCount > 0 ? (totalSentiment / sentimentCount) * 100 : 0;

  return {
    currentSpeakerId,
    currentRoundNumber,
    currentRoundLabel,
    revealedVotes,
    runningSentimentScore,
  };
}

const ALL_AGENTS: readonly string[] = AGENT_ORDER;

// ═══════════════════════════════════════════════════════════════════════
// COMPACT ANALYTICS CARD
// ═══════════════════════════════════════════════════════════════════════
function CompactAnalyticsRow({
  roundNum,
  roundLabel,
  totalRounds,
  sentimentScore,
  revealedVotes,
  conclusion,
  showConfidence,
}: {
  roundNum: number;
  roundLabel: string;
  totalRounds: number;
  sentimentScore: number;
  revealedVotes: Record<string, "support" | "oppose" | "neutral">;
  conclusion: DebateConclusion | null;
  showConfidence: boolean;
}) {
  const debatingAgents = ALL_AGENTS.filter((id) => id !== "chair");
  const supportCount = Object.values(revealedVotes).filter((v) => v === "support").length;
  const opposeCount = Object.values(revealedVotes).filter((v) => v === "oppose").length;

  const sentimentLabel =
    sentimentScore > 60 ? "Strongly Positive"
    : sentimentScore > 20 ? "Slightly Positive"
    : sentimentScore > -20 ? "Neutral"
    : sentimentScore > -60 ? "Slightly Negative"
    : "Strongly Negative";

  const sentimentColor = sentimentScore > 0 ? "#16A34A" : sentimentScore < 0 ? "#DC2626" : "#6B7280";

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {/* Round Progress */}
      <div className="card p-3">
        <div className="flex items-center gap-1.5 mb-1">
          <Info size={11} className="text-primary" />
          <span className="text-[8px] font-semibold text-text-secondary uppercase tracking-wider">
            Round
          </span>
        </div>
        <p className="text-sm font-bold text-text-primary">
          {roundNum}<span className="text-text-muted font-normal text-xs">/{totalRounds}</span>
        </p>
        <p className="text-[9px] text-text-muted truncate mt-0.5">{roundLabel || "—"}</p>
      </div>

      {/* Sentiment */}
      <div className="card p-3">
        <div className="flex items-center gap-1.5 mb-1">
          <TrendingUp size={11} className="text-primary" />
          <span className="text-[8px] font-semibold text-text-secondary uppercase tracking-wider">
            Sentiment
          </span>
        </div>
        <p className="text-sm font-bold font-mono" style={{ color: sentimentColor }}>
          {sentimentScore > 0 ? "+" : ""}{sentimentScore.toFixed(0)}
        </p>
        <p className="text-[9px] text-text-muted mt-0.5">{sentimentLabel}</p>
      </div>

      {/* Vote Tally */}
      <div className="card p-3">
        <div className="flex items-center gap-1.5 mb-1">
          <Users size={11} className="text-primary" />
          <span className="text-[8px] font-semibold text-text-secondary uppercase tracking-wider">
            Votes
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-green-600">{supportCount}✓</span>
          <span className="text-[9px] text-text-muted">/</span>
          <span className="text-xs font-bold text-red-600">{opposeCount}✗</span>
          <span className="text-[9px] text-text-muted">/</span>
          <span className="text-xs font-bold text-gray-500">{debatingAgents.length - supportCount - opposeCount}–</span>
        </div>
        <div className="flex items-center gap-1 mt-1">
          {debatingAgents.map((id) => {
            const vote = revealedVotes[id];
            return (
              <div
                key={id}
                className={`w-4 h-4 rounded-full bg-cover bg-center flex-shrink-0 ${
                  vote ? "ring-1 ring-gray-300" : "opacity-30 grayscale"
                }`}
                style={{
                  backgroundImage: `url('${AGENT_PERSONAS[id]?.avatarUrl}')`,
                  backgroundColor: "#f0f0f0",
                }}
                title={`${AGENT_PERSONAS[id]?.name}: ${vote || "pending"}`}
              />
            );
          })}
        </div>
      </div>

      {/* Confidence */}
      <div className="card p-3">
        <div className="flex items-center gap-1.5 mb-1">
          <Shield size={11} className="text-primary" />
          <span className="text-[8px] font-semibold text-text-secondary uppercase tracking-wider">
            Confidence
          </span>
        </div>
        {showConfidence && conclusion ? (
          <>
            <p className={`text-sm font-bold font-mono ${
              conclusion.confidenceScore >= 70 ? "text-green-600"
              : conclusion.confidenceScore >= 40 ? "text-amber-500"
              : "text-red-600"
            }`}>
              {conclusion.confidenceScore}%
            </p>
            <div className="w-full h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${conclusion.confidenceScore}%`,
                  backgroundColor:
                    conclusion.confidenceScore >= 70 ? "#16A34A"
                    : conclusion.confidenceScore >= 40 ? "#F59E0B"
                    : "#DC2626",
                }}
              />
            </div>
          </>
        ) : (
          <>
            <p className="text-sm font-bold text-text-muted font-mono">—</p>
            <p className="text-[9px] text-text-muted mt-0.5">Awaiting conclusion</p>
          </>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// BOARDROOM CONTENT
// ═══════════════════════════════════════════════════════════════════════
function BoardroomContent() {
  const searchParams = useSearchParams();
  const [topic, setTopic] = useState(searchParams.get("topic") || "");
  const [debate, setDebate] = useState<BoardroomDebate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autoStartedRef = useRef(false);

  // ─── Playback state ──────────────────────────────────────────────────
  const [playbackQueue, setPlaybackQueue] = useState<QueueItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showVerdict, setShowVerdict] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [activeTab, setActiveTab] = useState<TabId>("transcript");
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Derived state
  const derived = computeDerivedState(playbackQueue, currentIndex + 1);
  const speakerId = derived.currentSpeakerId;
  const roundNum = derived.currentRoundNumber;
  const roundLabel = derived.currentRoundLabel;
  const revealedVotes = derived.revealedVotes;
  const sentiment = derived.runningSentimentScore;

  const currentTurn: DebateTurn | null =
    currentIndex >= 0 && currentIndex < playbackQueue.length
      ? playbackQueue[currentIndex].type === "turn"
        ? (playbackQueue[currentIndex] as { type: "turn"; turn: DebateTurn }).turn
        : null
      : null;

  const revealedTurns: DebateTurn[] = playbackQueue
    .slice(0, currentIndex + 1)
    .filter((item): item is { type: "turn"; turn: DebateTurn } => item.type === "turn")
    .map((item) => item.turn);

  // ─── Build queue ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!debate) return;
    const queue: QueueItem[] = [];
    debate.rounds.forEach((round) => {
      queue.push({ type: "round_divider", label: `Round ${round.roundNumber} — ${round.roundLabel}` });
      round.turns.forEach((turn) => { queue.push({ type: "turn", turn }); });
    });
    setPlaybackQueue(queue);
    setCurrentIndex(-1);
    setShowVerdict(false);
    setIsPlaying(false);
    setSessionSeconds(0);
    setActiveTab("transcript");
  }, [debate]);

  // ─── Session timer ──────────────────────────────────────────────────
  useEffect(() => {
    if (isPlaying && currentIndex >= 0) {
      sessionTimerRef.current = setInterval(() => setSessionSeconds((p) => p + 1), 1000);
    } else if (sessionTimerRef.current) {
      clearInterval(sessionTimerRef.current);
      sessionTimerRef.current = null;
    }
    return () => { if (sessionTimerRef.current) { clearInterval(sessionTimerRef.current); sessionTimerRef.current = null; } };
  }, [isPlaying, currentIndex >= 0]);

  // ─── Auto-advance playback engine ──────────────────────────────────
  const advancePlayback = useCallback(() => {
    if (!isPlaying) return;
    setCurrentIndex((prev) => {
      const next = prev + 1;
      if (next >= playbackQueue.length) {
        setShowVerdict(true);
        setIsPlaying(false);
        return prev;
      }
      return next;
    });
  }, [isPlaying, playbackQueue.length]);

  useEffect(() => {
    if (!isPlaying || currentIndex < 0 || currentIndex >= playbackQueue.length - 1) {
      if (currentIndex >= playbackQueue.length - 1 && debate && isPlaying) {
        setShowVerdict(true);
        setIsPlaying(false);
      }
      return;
    }
    const item = playbackQueue[currentIndex];
    const delay = item.type === "round_divider"
      ? 800
      : Math.min(2000, 800 + (item as { type: "turn"; turn: DebateTurn }).turn.message.length * 10);
    advanceTimerRef.current = setTimeout(advancePlayback, delay);
    return () => { if (advanceTimerRef.current) { clearTimeout(advanceTimerRef.current); advanceTimerRef.current = null; } };
  }, [isPlaying, currentIndex, playbackQueue, advancePlayback, debate]);

  // ─── Auto-start from URL param ──────────────────────────────────────
  useEffect(() => {
    if (topic.trim() && !autoStartedRef.current && !debate && !loading) {
      autoStartedRef.current = true;
      startDebate();
    }
  }, [topic]);

  // ─── API call ────────────────────────────────────────────────────────
  const startDebate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError(null);
    setDebate(null);
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

  // ─── Playback controls ──────────────────────────────────────────────
  const togglePlay = () => {
    if (!isPlaying && currentIndex < 0 && playbackQueue.length > 0) {
      setCurrentIndex(0);
      setIsPlaying(true);
      return;
    }
    setIsPlaying((p) => !p);
  };

  const skipForward = () => {
    if (advanceTimerRef.current) { clearTimeout(advanceTimerRef.current); advanceTimerRef.current = null; }
    setCurrentIndex((prev) => {
      const next = Math.min(prev + 1, playbackQueue.length - 1);
      if (next >= playbackQueue.length - 1 && playbackQueue.length > 0) { setShowVerdict(true); setIsPlaying(false); }
      return next;
    });
  };

  const skipBack = () => {
    if (advanceTimerRef.current) { clearTimeout(advanceTimerRef.current); advanceTimerRef.current = null; }
    setCurrentIndex((prev) => Math.max(prev - 1, -1));
    setShowVerdict(false);
  };

  const replay = () => {
    if (advanceTimerRef.current) { clearTimeout(advanceTimerRef.current); advanceTimerRef.current = null; }
    setCurrentIndex(-1); setShowVerdict(false); setIsPlaying(false); setSessionSeconds(0);
  };

  const reset = () => {
    if (advanceTimerRef.current) { clearTimeout(advanceTimerRef.current); advanceTimerRef.current = null; }
    setDebate(null); setTopic(""); setCurrentIndex(-1); setShowVerdict(false);
    setIsPlaying(false); setError(null); setSessionSeconds(0);
    autoStartedRef.current = false;
    window.history.replaceState({}, "", "/boardroom");
  };

  const debateStarted = currentIndex >= 0 && playbackQueue.length > 0;
  const debateFinished = showVerdict || (currentIndex >= playbackQueue.length - 1 && playbackQueue.length > 0);

  // ═══════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════
  return (
    <div className="p-3 sm:p-4 md:p-5 max-w-7xl mx-auto space-y-4 animate-fade-in">
      {/* ── Page Header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-sm">
            <Gavel size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-text-primary leading-tight">AI Boardroom</h1>
            <p className="text-[11px] text-text-secondary">Investment Committee Debate</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {debateStarted && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 border border-red-200"
            >
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">LIVE</span>
            </motion.div>
          )}
          {debateStarted && (
            <div className="font-mono text-xs font-bold text-text-primary tabular-nums bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200 min-w-[48px] text-center">
              {formatTimer(sessionSeconds)}
            </div>
          )}
          <div className="hidden sm:flex items-center gap-2">
            <button className="relative p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <Bell size={15} className="text-text-muted" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500" />
            </button>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-sm">
                <User size={12} className="text-white" />
              </div>
              <div className="hidden lg:block">
                <p className="text-[10px] font-bold text-text-primary leading-tight">Analyst</p>
                <p className="text-[8px] text-text-muted leading-tight">DB Group</p>
              </div>
              <ChevronDown size={12} className="text-text-muted" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Pre-debate input ─────────────────────────────────────────── */}
      {!debate && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-5 max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-primary" />
            <h2 className="text-sm font-bold text-text-primary">Investment Committee Debate Simulator</h2>
          </div>
          <p className="text-xs text-text-secondary mb-4 leading-relaxed">
            Watch AI agents debate strategic decisions for Deutsche Bank. Six committee members — CRO, Trader, Economist, Compliance Officer, Devil&apos;s Advocate, and Chair — will argue, cross-examine, and reach a verdict.
          </p>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {["Should DB reduce Italy exposure by 15%?", "Should DB increase German corporate lending by €2B?", "Should DB increase energy sector hedging to 80%?", "Should DB extend bond portfolio duration by 0.5 years?"].map((s) => (
              <button key={s} onClick={() => setTopic(s)}
                className="px-2.5 py-1 rounded-lg bg-gray-50 border border-border text-[10px] text-text-secondary hover:text-primary hover:border-primary/30 transition-all"
              >{s.length > 42 ? s.slice(0, 42) + "…" : s}</button>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && startDebate()}
              placeholder='e.g. "Should DB reduce Italy exposure by 15%?"'
              className="flex-1 bg-gray-50 border border-border rounded-xl px-4 h-12 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/40 transition-colors"
              disabled={loading} maxLength={200}
            />
            <button onClick={startDebate} disabled={loading || !topic.trim()}
              className="flex items-center justify-center gap-2 px-6 h-12 rounded-xl bg-primary text-white text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Convening committee...</> : <><Gavel size={16} /> Start Debate</>}
            </button>
          </div>
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
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

      {/* ── Loading ──────────────────────────────────────────────────── */}
      {loading && (
        <div className="card p-8 flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <div className="text-center">
            <p className="text-sm font-semibold text-text-primary">Convening the committee...</p>
            <p className="text-xs text-text-secondary mt-1">The CRO, Trader, Economist, Compliance, and Devil&apos;s Advocate are taking their seats</p>
          </div>
        </div>
      )}

      {/* ═══ ACTIVE DEBATE — NEW LAYOUT ════════════════════════════════ */}
      {debate && (
        <div className="flex flex-col lg:flex-row gap-4">
          {/* ── LEFT: Agent Sidebar ──────────────────────────────────── */}
          <div className="w-full lg:w-[88px] flex-shrink-0">
            <div className="card p-2">
              <AgentVideoGrid currentSpeakerId={speakerId} />
            </div>
          </div>

          {/* ── RIGHT: Main Content Area ──────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Topic Banner */}
            <div className="card p-3 bg-primary/[0.02] border-primary/10">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-primary flex-shrink-0" />
                <p className="text-xs font-medium text-text-primary">
                  Debate Topic: <span className="font-bold">{debate.topic}</span>
                </p>
              </div>
            </div>

            {/* Active Speaker Transcript */}
            <ActiveTurnPanel
              currentTurn={currentTurn}
              currentRoundNumber={roundNum}
              totalRounds={debate.rounds.length}
              currentRoundLabel={roundLabel}
              isPlaying={isPlaying}
              onTogglePlay={togglePlay}
              onSkipBack={skipBack}
              onSkipForward={skipForward}
              revealedTurns={revealedTurns.length}
              totalTurns={playbackQueue.filter((i) => i.type === "turn").length}
            />

            {/* Analytics Row */}
            <CompactAnalyticsRow
              roundNum={roundNum}
              roundLabel={roundLabel}
              totalRounds={debate.rounds.length}
              sentimentScore={sentiment}
              revealedVotes={revealedVotes}
              conclusion={debate.conclusion}
              showConfidence={showVerdict || debateFinished}
            />

            {/* Bottom Tab Bar */}
            <BottomTabBar
              activeTab={activeTab}
              onTabChange={setActiveTab}
              revealedTurns={revealedTurns}
              revealedVotes={revealedVotes}
              conclusion={debate.conclusion}
              allAgents={ALL_AGENTS}
            />

            {/* Replay / New Debate */}
            {debateFinished && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                <button onClick={replay}
                  className="flex items-center gap-1.5 px-4 h-9 rounded-xl bg-gray-100 text-text-secondary text-xs font-medium hover:text-text-primary hover:bg-gray-200 transition-all"
                ><RotateCcw size={13} /> Replay Debate</button>
                <button onClick={reset}
                  className="flex items-center gap-1.5 px-4 h-9 rounded-xl bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-all"
                ><Play size={13} /> New Debate</button>
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// WRAPPER WITH SUSPENSE
// ═══════════════════════════════════════════════════════════════════════
export default function BoardroomPage() {
  return (
    <Suspense fallback={
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="card p-8 flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm font-medium text-text-primary">Loading boardroom...</p>
        </div>
      </div>
    }>
      <BoardroomContent />
    </Suspense>
  );
}
