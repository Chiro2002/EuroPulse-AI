import { NextRequest, NextResponse } from "next/server";
import { generateStructuredResponse, getActiveProvider } from "@/lib/ai/provider";
import type { BoardroomDebate, DebateRound, DebateConclusion } from "@/lib/types";

// Boardroom generation needs more tokens for the full 3-round transcript
// and higher temperature for creative dialogue variety
const BOARDROOM_OPTIONS = {
  maxTokens: 8192,
  temperature: 0.85,
};

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Fisher-Yates shuffle
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Mock debate for fallback when no AI provider
function getFallbackDebate(topic: string): BoardroomDebate {
  return {
    topic,
    rounds: [
      {
        roundNumber: 1,
        roundLabel: "Opening Positions",
        turns: [
          { agent: "cro", message: `I recommend we approach "${topic}" with extreme caution. Our VaR limits are already stretched in European sovereign exposure, and increasing concentration would violate our internal risk appetite framework. Historical precedent from 2023 shows that similar exposures led to 40bp widening in CDS spreads.`, stance: "oppose" },
          { agent: "trader", message: `I see this as an opportunity, not a risk. The market is pricing in worst-case scenarios, but our analysis shows the downside is only 15% of current estimates. We have €2.3B in dry powder that's earning nothing — this is exactly the kind of asymmetric trade we should be putting on.`, stance: "support" },
          { agent: "economist", message: `The data suggests a more nuanced view. Our multi-factor models show a 62% probability of the base case, with tail risks evenly distributed. Historically, markets overreact to these events in the first 72 hours, then correct 70% of the move within 2 weeks. Patience is warranted.`, stance: "neutral" },
          { agent: "compliance", message: `From a regulatory perspective, we need to consider the disclosure implications. The ECB is closely monitoring sector concentrations, and any increase would trigger additional Pillar 3 capital requirements under Article 430 CRR. The reputational risk of being seen as aggressive in this environment cannot be overstated.`, stance: "oppose" },
          { agent: "devils_advocate", message: `I'll play contrarian: everyone here seems to be leaning cautious, which means the consensus is already priced in. If we do nothing and the market rallies, we'll be explaining to the board why we missed the recovery. The real question isn't whether to act — it's what's the worst that happens if we're wrong on both sides?`, stance: "neutral" },
        ],
      },
      {
        roundNumber: 2,
        roundLabel: "Cross-Examination",
        turns: [
          { agent: "trader", message: `Sarah, your VaR concerns are valid, but our current VaR utilization is only 67% of limit. We have €850M of headroom even under stressed conditions. The question is whether we're managing risk or being paralyzed by it.`, stance: "support", respondingTo: "cro" },
          { agent: "cro", message: `Marcus, your dry powder argument ignores correlation risk. If this trade goes wrong during a broader market stress event — which has a 35% probability per our models — we'd breach limits across multiple desks simultaneously. That's not being paralyzed; that's prudent risk management.`, stance: "oppose", respondingTo: "trader" },
          { agent: "economist", message: `James raises valid regulatory concerns, but I'd note that Article 430 specifically allows for concentration increases under justified economic circumstances. If we can document the asymmetric risk/reward, compliance can be structured rather than binary.`, stance: "neutral", respondingTo: "compliance" },
          { agent: "compliance", message: `Elena, while technically correct, the documentation burden would be substantial — approximately 3-4 weeks of legal review. By then, the opportunity Marcus describes may have passed. This timing risk is itself a factor the committee should weigh.`, stance: "oppose", respondingTo: "economist" },
          { agent: "devils_advocate", message: `Everyone's making valid points, but notice we haven't discussed the €1.2B of exposure we ALREADY have. The decision isn't just about new positions — it's about whether our existing book is optimally structured for the scenarios we're discussing. That's the blind spot here.`, stance: "neutral", respondingTo: "cro" },
        ],
      },
      {
        roundNumber: 3,
        roundLabel: "Devil's Advocate Challenge",
        turns: [
          { agent: "devils_advocate", message: `I'm hearing a consensus forming around a partial, hedged approach. Let me stress-test that: what if the ECB delivers a hawkish surprise next week? Your hedge ratios would need to double, costing 25-30bps in premium. And if the opposite happens — a dovish surprise — the unhedged portion underperforms. Either way, the compromise position may be the worst of both worlds. Why not pick a direction and size accordingly?`, challenging: "consensus" },
          { agent: "trader", message: `Alex makes a fair point. If we're going to act, we should act decisively. Half-measures in volatile markets tend to generate half-results. I'd rather see us commit to a clear directional stance with appropriate sizing rather than fudge it with layers of hedging that bleed carry.`, stance: "support", respondingTo: "devils_advocate" },
        ],
      },
    ],
    conclusion: {
      agent: "chair",
      finalDecision: `After thorough debate, the committee recommends a measured approach: proceed with 60% of the proposed exposure increase, fully hedged via 3-month options with a stop-loss at 8% drawdown. Establish a bi-weekly review cadence and pre-define exit criteria tied to specific market levels. This balances the trading desk's opportunity capture with the CRO's risk constraints and compliance's regulatory requirements.`,
      confidenceScore: 72,
      votes: { cro: "oppose", trader: "support", economist: "neutral", compliance: "oppose", devils_advocate: "neutral" },
      reasoningSummary: `The committee was split 2-2 with one neutral, reflecting genuine uncertainty in the outlook. The Chair's compromise — partial exposure with full hedging and strict exit criteria — bridges the divide by allowing upside participation while capping downside. The 60% sizing reflects the balanced risk assessment while acknowledging the trader's opportunity thesis.`,
      dissentingView: `Sarah Chen (CRO) maintains that any increase in concentration risk is unwarranted given the current macro uncertainty, and recommends maintaining existing exposure levels until ECB guidance becomes clearer in the next quarter.`,
    },
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const topic = (body?.topic || "").trim();

    if (!topic) {
      return NextResponse.json(
        { error: "Topic is required" },
        { status: 400 }
      );
    }

    if (topic.length > 200) {
      return NextResponse.json(
        { error: "Topic must be 200 characters or less" },
        { status: 400 }
      );
    }

    // Check if AI is available
    const provider = getActiveProvider();
    if (provider === "none") {
      const fallback = getFallbackDebate(topic);
      return NextResponse.json(fallback);
    }

    // Shuffle speaking order for Round 1
    const debatingAgents = ["cro", "trader", "economist", "compliance", "devils_advocate"];
    const speakingOrder = shuffle(debatingAgents);

    const schema = {
      topic: "string",
      rounds: "array of round objects",
      conclusion: "object with finalDecision, confidenceScore, votes, reasoningSummary, dissentingView",
    };

    const systemPrompt = `You are simulating a Deutsche Bank investment committee debate. You must generate a complete, realistic multi-agent debate transcript as a SINGLE valid JSON object. Output ONLY the JSON — no markdown fences, no preamble, no explanation outside the JSON.

THE TOPIC UNDER DEBATE: "${topic}"

THE SIX COMMITTEE MEMBERS (use these exact agent IDs):

1. "cro" — Chief Risk Officer
   Personality: cautious, conservative, downside-focused. Cites regulatory capital requirements, VaR limits, historical loss events. Speaks in measured, careful language. Always asks "what's our worst case."

2. "trader" — Head of Trading
   Personality: aggressive, opportunistic, sees volatility as opportunity not just threat. Impatient with excessive caution. Cites market positioning, liquidity, timing. Speaks confidently, sometimes dismissive of overly conservative views.

3. "economist" — Chief Economist
   Personality: data-driven, dispassionate, long-term thinker. Cites historical patterns, macro data, base rates. Refuses to be swayed by short-term emotion. Speaks in measured analytical language, often starts with "Historically..." or "The data suggests..."

4. "compliance" — Compliance Officer
   Personality: rules-focused, reputation-conscious, risk-averse in a different way than CRO (focused on regulatory/legal/reputational exposure, not just financial loss). Raises points nobody else considers — disclosure obligations, precedent-setting decisions, regulator optics.

5. "devils_advocate" — Devil's Advocate
   Personality: deliberately contrarian. Does not have a fixed position — their job is to attack whatever position seems to be winning consensus, to stress-test the group's thinking. Sharp, direct, sometimes uncomfortable questions.

6. "chair" — Committee Chair
   Personality: neutral moderator and final decision-maker. Does NOT participate in the debate rounds. Only speaks once, at the end, to synthesize the arguments into a final decision.

SPEAKING ORDER FOR ROUND 1 (opening positions), you MUST follow this exact order: ${speakingOrder.join(", ")}

STRUCTURE TO GENERATE:

Round 1 — "Opening Positions": each of the 5 debating agents (not chair) gives ONE opening statement, 2-3 sentences, stating their initial stance (support/oppose/neutral on the topic) with 2 concrete supporting reasons. Follow the given speaking order.

Round 2 — "Cross-Examination": each of the 5 agents speaks again, but this time each one must explicitly reference and respond to a specific point made by a DIFFERENT agent in Round 1 (agree, disagree, or complicate it). Include which agent they're responding to. Vary who responds to whom — do not just have everyone respond to the same agent. 2-3 sentences each.

Round 3 — "Devil's Advocate Challenge": the devils_advocate agent gives ONE longer statement (3-4 sentences) directly challenging whichever position seems to be gaining consensus after Round 2, forcing the group to defend it. Then ONE other agent (your choice, whichever is most relevant) gives a brief 1-2 sentence rebuttal to the challenge.

Conclusion — the "chair" synthesizes everything into a final decision. Must include: the final recommendation (1-2 sentences, decisive), a confidenceScore (0-100, reflecting how much consensus vs disagreement existed), a vote tally for all 5 debating agents (each: "support" | "oppose" | "neutral"), a 2-3 sentence reasoningSummary explaining why this conclusion won out, and ONE dissentingView sentence capturing the strongest remaining objection (usually from whoever voted opposite the final decision, or the devils_advocate).

OUTPUT JSON SCHEMA (follow exactly, no extra fields, no missing fields):

{
  "topic": "string, the debate topic as given",
  "rounds": [
    {
      "roundNumber": 1,
      "roundLabel": "Opening Positions",
      "turns": [
        { "agent": "cro", "message": "string", "stance": "support|oppose|neutral" },
        { "agent": "trader", "message": "string", "stance": "support|oppose|neutral" },
        { "agent": "economist", "message": "string", "stance": "support|oppose|neutral" },
        { "agent": "compliance", "message": "string", "stance": "support|oppose|neutral" },
        { "agent": "devils_advocate", "message": "string", "stance": "support|oppose|neutral" }
      ]
    },
    {
      "roundNumber": 2,
      "roundLabel": "Cross-Examination",
      "turns": [
        { "agent": "string (one of the 5)", "message": "string", "respondingTo": "string (agent id being responded to)", "stance": "support|oppose|neutral" }
      ]
    },
    {
      "roundNumber": 3,
      "roundLabel": "Devil's Advocate Challenge",
      "turns": [
        { "agent": "devils_advocate", "message": "string", "challenging": "string (agent id or 'consensus')" },
        { "agent": "string (one of the other 4)", "message": "string", "respondingTo": "devils_advocate" }
      ]
    }
  ],
  "conclusion": {
    "agent": "chair",
    "finalDecision": "string",
    "confidenceScore": 0,
    "votes": { "cro": "support|oppose|neutral", "trader": "...", "economist": "...", "compliance": "...", "devils_advocate": "..." },
    "reasoningSummary": "string",
    "dissentingView": "string"
  }
}

Ground every argument in the specific topic given — do not generate generic filler. Reference concrete-sounding figures, countries, sectors, or numbers relevant to the topic (they can be realistic illustrative estimates, not real live data). Keep every "message" field between 20-60 words. Return ONLY the JSON object, nothing else.`;

    const userPrompt = `Generate a complete committee debate transcript for: "${topic}".

Speaking order for Round 1: ${speakingOrder.join(", ")}

Remember: ground every argument in the specific topic. Reference realistic figures. Return ONLY valid JSON.`;

    let result = await generateStructuredResponse<BoardroomDebate>(
      systemPrompt,
      userPrompt,
      schema,
      BOARDROOM_OPTIONS
    );

    // Retry once if parsing failed
    if (!result || !result.rounds || result.rounds.length < 3 || !result.conclusion) {
      const retryPrompt = `${userPrompt}\n\nYour previous output was invalid JSON or missing required fields (rounds[3], conclusion.votes for all 5 agents). Return ONLY valid JSON matching the schema exactly.`;
      result = await generateStructuredResponse<BoardroomDebate>(
        systemPrompt + "\n\nCRITICAL: You MUST return valid JSON. Validate your output before sending.",
        retryPrompt,
        schema,
        { ...BOARDROOM_OPTIONS, temperature: 0.7 } // Slightly lower temp on retry for more reliable JSON
      );
    }

    if (!result || !result.rounds || result.rounds.length < 3 || !result.conclusion) {
      // Fallback to mock if AI failed
      const fallback = getFallbackDebate(topic);
      return NextResponse.json(fallback);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Boardroom API error:", error);
    return NextResponse.json(
      { error: "Failed to generate debate. Please try again." },
      { status: 500 }
    );
  }
}
