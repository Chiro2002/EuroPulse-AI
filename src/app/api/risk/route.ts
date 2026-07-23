import { NextRequest, NextResponse } from "next/server";
import { buildRiskData } from "@/lib/data/riskData";
import { explainCountryRisk } from "@/lib/ai/agents";
import { generateStructuredResponse, isAIAvailable } from "@/lib/ai/provider";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(request: NextRequest) {
  const headers = {
    "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
  };
  const searchParams = request.nextUrl.searchParams;
  const country = searchParams.get("country");
  const dimension = searchParams.get("dimension") || "total";

  try {
    const data = buildRiskData();

    // If a specific country is requested
    if (country) {
      const countryData = data.countries.find((c) => c.code === country.toUpperCase());
      if (!countryData) {
        return NextResponse.json({ error: "Country not found" }, { status: 404 });
      }

      // Generate AI-powered risk explanation for this country
      const explanation = await explainCountryRisk({
        code: countryData.code,
        name: countryData.name,
        totalRisk: countryData.totalRisk,
        breakdown: countryData.breakdown,
        details: (countryData as any).details || {},
      });

      return NextResponse.json({
        country: {
          ...countryData,
          explanation: explanation || getDefaultExplanation(countryData.name, countryData.totalRisk, countryData.breakdown),
        },
        sectorStress: Object.fromEntries(
          Object.entries(data.sectorStress).map(([sector, countries]) => [
            sector,
            { [country.toUpperCase()]: countries[country.toUpperCase()] },
          ])
        ),
        historicalTrend: data.historicalTrends[country.toUpperCase()] || [],
        eventHighlights: data.eventHighlights,
        timestamp: new Date().toISOString(),
      });
    }

    // Generate AI-powered summary for the overall risk landscape
    const sortedByRisk = [...data.countries].sort((a, b) => b.totalRisk - a.totalRisk);
    const topInsights = await generateRiskTopInsights(sortedByRisk, data);

    return NextResponse.json({
      ...data,
      topInsights,
      timestamp: new Date().toISOString(),
    }, { headers });
  } catch (error) {
    console.error("Risk API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch risk data" },
      { status: 500 }
    );
  }
}

function getDefaultExplanation(name: string, totalRisk: number, breakdown: any): string {
  return `${name} has a composite risk score of ${totalRisk}/100. Key risk drivers include inflation (${breakdown?.inflation || "N/A"}/100), energy (${breakdown?.energy || "N/A"}/100), and geopolitical factors (${breakdown?.geopolitical || "N/A"}/100). ${totalRisk >= 60 ? "This is an elevated risk level requiring active monitoring." : totalRisk >= 40 ? "Moderate risk — standard monitoring protocols apply." : "Lower risk profile — routine monitoring sufficient."}`;
}

async function generateRiskTopInsights(sortedByRisk: any[], data: any) {
  const mostVuln = sortedByRisk[0];
  const mostStable = sortedByRisk[sortedByRisk.length - 1];

  // Detect which dimension is rising fastest (has highest avg score)
  const dimensions = ["inflation", "energy", "debt", "unemployment", "housing", "geopolitical"];
  const avgByDim = dimensions.map(d => ({
    dim: d,
    avg: sortedByRisk.reduce((s: number, c: any) => s + (c.breakdown?.[d] || c[d] || 0), 0) / sortedByRisk.length,
  }));
  const risingFastest = avgByDim.sort((a, b) => b.avg - a.avg)[0];

  const europeStressTrend = Math.round(
    sortedByRisk.reduce((s: number, c: any) => s + c.totalRisk, 0) / sortedByRisk.length
  );

  // Try AI-powered summary, fall back to deterministic
  let aiSummary = `Europe's risk landscape is currently led by ${mostVuln?.name || "multiple countries"} (${mostVuln?.totalRisk || "N/A"}/100), with ${risingFastest?.dim || "inflation"} being the most pressing dimension across the region (avg ${Math.round(risingFastest?.avg || 0)}/100). ${mostStable?.name || "Some countries"} remains the most stable (${mostStable?.totalRisk || "N/A"}/100). The composite European stress trend sits at ${europeStressTrend}/100.`;

  if (isAIAvailable()) {
    const dimensionsSummary = dimensions
      .map(d => `${d}: ${Math.round(avgByDim.find(a => a.dim === d)?.avg || 0)}/100 avg`)
      .join(", ");
    const countrySummary = sortedByRisk
      .slice(0, 5)
      .map((c: any) => `${c.name}: ${c.totalRisk}/100`)
      .join(", ");

    const result = await generateStructuredResponse<{ summary: string }>(
      `Senior EU risk analyst. Summarize the European risk landscape in 3 sentences for a Deutsche Bank risk committee briefing.

Country risk scores: ${countrySummary}
Dimensions: ${dimensionsSummary}
Top risk: ${mostVuln?.name} (${mostVuln?.totalRisk}/100)
Most stable: ${mostStable?.name} (${mostStable?.totalRisk}/100)
Europe overall: ${europeStressTrend}/100

Return JSON with single field "summary" — 3 concise sentences. For bank executives.`,
      "Generate risk landscape summary for DB risk committee.",
      { summary: "string" },
      { maxTokens: 512, temperature: 0.3 }
    );
    if (result?.summary) aiSummary = result.summary;
  }

  return {
    mostVulnerable: `${mostVuln?.name || "N/A"} — ${mostVuln?.totalRisk || "N/A"}/100`,
    risingFastest: `${risingFastest?.dim || "N/A"} (avg ${Math.round(risingFastest?.avg || 0)}/100)`,
    mostStable: `${mostStable?.name || "N/A"} — ${mostStable?.totalRisk || "N/A"}/100`,
    europeStressTrend,
    aiSummary,
  };
}
