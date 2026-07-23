"use client";

import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Lightbulb,
  BarChart3,
  Sparkles,
  CornerDownRight,
  Check,
  Minus,
} from "lucide-react";
import { AGENT_PERSONAS } from "@/lib/data/agentConfig";
import type { DebateTurn, DebateConclusion } from "@/lib/types";

export type TabId = "transcript" | "keypoints" | "votes" | "insights";

interface BottomTabBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  revealedTurns: DebateTurn[];
  revealedVotes: Record<string, "support" | "oppose" | "neutral">;
  conclusion: DebateConclusion | null;
  allAgents: readonly string[];
}

const TABS: { id: TabId; label: string; icon: typeof MessageSquare }[] = [
  { id: "transcript", label: "Debate Transcript", icon: MessageSquare },
  { id: "keypoints", label: "Key Points", icon: Lightbulb },
  { id: "votes", label: "Vote Tracker", icon: BarChart3 },
  { id: "insights", label: "AI Insights", icon: Sparkles },
];

// ─── Tab Button ───────────────────────────────────────────────────────
function TabButton({
  tab,
  isActive,
  onClick,
}: {
  tab: (typeof TABS)[number];
  isActive: boolean;
  onClick: () => void;
}) {
  const Icon = tab.icon;
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-[10px] font-semibold transition-all ${
        isActive
          ? "bg-[#0018A8] text-white shadow-sm"
          : "bg-white text-text-secondary hover:bg-gray-50 hover:text-text-primary border border-gray-200"
      }`}
    >
      <Icon size={13} />
      <span className="hidden sm:inline">{tab.label}</span>
    </button>
  );
}

// ─── Tab Content: Transcript ──────────────────────────────────────────
function TranscriptTab({ turns }: { turns: DebateTurn[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [turns.length]);

  if (turns.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-xs text-text-muted italic">
          No turns revealed yet. Press Play to start the debate.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="space-y-1 max-h-[240px] overflow-y-auto scrollbar-thin pr-1"
    >
      {turns.map((turn, i) => {
        const config = AGENT_PERSONAS[turn.agent];
        return (
          <div
            key={i}
            className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {/* Mini avatar */}
            <div
              className="w-6 h-6 rounded-full flex-shrink-0 bg-cover bg-center"
              style={{
                backgroundImage: `url('${config?.avatarUrl}')`,
                backgroundColor: "#f0f0f0",
              }}
              title={config?.name || turn.agent}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                <span className="text-[10px] font-bold text-text-primary">
                  {config?.name || turn.agent}
                </span>
                {turn.respondingTo && (
                  <span className="text-[8px] text-text-muted flex items-center gap-0.5">
                    <CornerDownRight size={8} />
                    to {AGENT_PERSONAS[turn.respondingTo]?.name.split(" ")[0]}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-text-secondary leading-relaxed">
                {turn.message}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Tab Content: Key Points ──────────────────────────────────────────
function KeyPointsTab({ turns }: { turns: DebateTurn[] }) {
  if (turns.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-xs text-text-muted italic">No key points yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[240px] overflow-y-auto scrollbar-thin pr-1">
      {turns.map((turn, i) => {
        const config = AGENT_PERSONAS[turn.agent];
        const stanceColor =
          turn.stance === "support"
            ? "#16A34A"
            : turn.stance === "oppose"
            ? "#DC2626"
            : "#6B7280";
        const firstSentence = turn.message.split(/[.!?]/)[0] + ".";
        return (
          <div
            key={i}
            className="flex items-start gap-2 p-2 rounded-lg bg-white border border-gray-100"
          >
            <div
              className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
              style={{ backgroundColor: stanceColor }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className={`text-[9px] font-bold`} style={{ color: stanceColor }}>
                  {config?.name}
                </span>
                <span
                  className={`text-[8px] font-semibold uppercase px-1 py-0.5 rounded`}
                  style={{
                    backgroundColor: `${stanceColor}15`,
                    color: stanceColor,
                  }}
                >
                  {turn.stance || "neutral"}
                </span>
              </div>
              <p className="text-[11px] text-text-secondary leading-relaxed">
                {firstSentence}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Tab Content: Vote Tracker ────────────────────────────────────────
function VotesTab({
  revealedVotes,
  allAgents,
}: {
  revealedVotes: Record<string, "support" | "oppose" | "neutral">;
  allAgents: readonly string[];
}) {
  const debatingAgents = allAgents.filter((id) => id !== "chair");
  const supportCount = Object.values(revealedVotes).filter(
    (v) => v === "support"
  ).length;
  const opposeCount = Object.values(revealedVotes).filter(
    (v) => v === "oppose"
  ).length;
  const neutralCount = Object.values(revealedVotes).filter(
    (v) => v === "neutral"
  ).length;
  const totalRevealed = Object.keys(revealedVotes).length;

  return (
    <div className="space-y-3 max-h-[240px] overflow-y-auto scrollbar-thin pr-1">
      {/* Summary bars */}
      <div className="space-y-1.5">
        {([
          { label: "Support", count: supportCount, color: "#16A34A" },
          { label: "Oppose", count: opposeCount, color: "#DC2626" },
          { label: "Neutral", count: neutralCount, color: "#6B7280" },
        ] as const).map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span className="text-[9px] font-semibold w-14 text-right" style={{ color: item.color }}>
              {item.label}
            </span>
            <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: item.color }}
                initial={{ width: 0 }}
                animate={{
                  width: `${
                    totalRevealed > 0 ? (item.count / debatingAgents.length) * 100 : 0
                  }%`,
                }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <span className="text-[10px] font-mono text-text-secondary w-4">
              {item.count}
            </span>
          </div>
        ))}
      </div>

      {/* Individual votes */}
      <div className="grid grid-cols-2 gap-1.5">
        {debatingAgents.map((agentId) => {
          const config = AGENT_PERSONAS[agentId];
          const vote = revealedVotes[agentId];
          return (
            <div
              key={agentId}
              className={`flex items-center gap-2 p-2 rounded-lg border ${
                vote
                  ? "bg-white border-gray-200"
                  : "bg-gray-50 border-dashed border-gray-200 opacity-50"
              }`}
            >
              <div
                className="w-6 h-6 rounded-full bg-cover bg-center flex-shrink-0"
                style={{
                  backgroundImage: `url('${config?.avatarUrl}')`,
                  backgroundColor: "#f0f0f0",
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-bold text-text-primary truncate">
                  {config?.name.split(" ")[0]}
                </p>
                {vote ? (
                  <span
                    className={`text-[8px] font-semibold ${
                      vote === "support"
                        ? "text-green-600"
                        : vote === "oppose"
                        ? "text-red-600"
                        : "text-gray-500"
                    }`}
                  >
                    {vote === "support" ? "✓ Support" : vote === "oppose" ? "✗ Oppose" : "– Neutral"}
                  </span>
                ) : (
                  <span className="text-[8px] text-text-muted italic">Pending...</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Tab Content: AI Insights ─────────────────────────────────────────
function InsightsTab({ conclusion }: { conclusion: DebateConclusion | null }) {
  if (!conclusion) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-xs text-text-muted italic">
          Insights will appear once the debate concludes.
        </p>
      </div>
    );
  }

  const confidenceColor =
    conclusion.confidenceScore >= 70
      ? "#16A34A"
      : conclusion.confidenceScore >= 40
      ? "#F59E0B"
      : "#DC2626";

  return (
    <div className="space-y-3 max-h-[240px] overflow-y-auto scrollbar-thin pr-1">
      {/* Reasoning */}
      <div className="p-3 rounded-xl bg-white border border-gray-100">
        <p className="text-[9px] font-semibold text-text-secondary uppercase tracking-wider mb-1">
          Reasoning Summary
        </p>
        <p className="text-[11px] text-text-primary leading-relaxed">
          {conclusion.reasoningSummary}
        </p>
      </div>

      {/* Dissenting */}
      <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200">
        <div className="flex items-center gap-1 mb-1">
          <span className="text-[9px] font-bold text-amber-700 uppercase tracking-wider">
            Dissenting View
          </span>
        </div>
        <p className="text-[11px] text-amber-900/90 leading-relaxed">
          {conclusion.dissentingView}
        </p>
      </div>

      {/* Confidence */}
      <div className="flex items-center gap-2 p-3 rounded-xl bg-white border border-gray-100">
        <span className="text-[9px] text-text-secondary">Confidence:</span>
        <span
          className="text-sm font-bold font-mono"
          style={{ color: confidenceColor }}
        >
          {conclusion.confidenceScore}%
        </span>
        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${conclusion.confidenceScore}%`,
              backgroundColor: confidenceColor,
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────
export function BottomTabBar({
  activeTab,
  onTabChange,
  revealedTurns,
  revealedVotes,
  conclusion,
  allAgents,
}: BottomTabBarProps) {
  return (
    <div className="card p-3 space-y-3">
      {/* Tab buttons */}
      <div className="flex gap-1.5">
        {TABS.map((tab) => (
          <TabButton
            key={tab.id}
            tab={tab}
            isActive={activeTab === tab.id}
            onClick={() => onTabChange(tab.id)}
          />
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
        >
          {activeTab === "transcript" && (
            <TranscriptTab turns={revealedTurns} />
          )}
          {activeTab === "keypoints" && (
            <KeyPointsTab turns={revealedTurns} />
          )}
          {activeTab === "votes" && (
            <VotesTab
              revealedVotes={revealedVotes}
              allAgents={allAgents}
            />
          )}
          {activeTab === "insights" && (
            <InsightsTab conclusion={conclusion} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
