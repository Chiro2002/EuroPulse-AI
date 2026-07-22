import { NextRequest, NextResponse } from "next/server";
import { runSimulation, runCustomSimulation } from "@/lib/logic/simulatorEngine";
import { generateScenarioNarrative, generateDBActions } from "@/lib/ai/agents";
import { SCENARIO_DEFINITIONS } from "@/lib/data/scenarios";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const scenarioId = searchParams.get("scenario");
  const customParam = searchParams.get("custom");

  try {
    // Custom simulation via query params
    if (customParam === "true") {
      const params = {
        oilChange: parseFloat(searchParams.get("oilChange") || "0"),
        ecbRateChange: parseFloat(searchParams.get("ecbRateChange") || "0"),
        eurUsdChange: parseFloat(searchParams.get("eurUsdChange") || "0"),
        gasChange: parseFloat(searchParams.get("gasChange") || "0"),
        geopoliticalIntensity: parseFloat(searchParams.get("geopoliticalIntensity") || "0"),
      };
      const intensity = parseFloat(searchParams.get("intensity") || "1.0");
      const result = runCustomSimulation(params, intensity);
      const [narrative, actions] = await Promise.all([
        generateScenarioNarrative(result),
        generateDBActions(result),
      ]);

      return NextResponse.json({
        result,
        narrative,
        actions,
        timestamp: new Date().toISOString(),
      });
    }

    // Preset scenario simulation
    if (scenarioId) {
      const scenario = SCENARIO_DEFINITIONS.find((s) => s.id === scenarioId);
      if (!scenario) {
        return NextResponse.json({ error: "Scenario not found" }, { status: 404 });
      }

      const intensity = parseFloat(searchParams.get("intensity") || "1.0");
      const timeHorizon = (searchParams.get("timeHorizon") || "12M") as "immediate" | "3M" | "6M" | "12M";

      const result = runSimulation(scenarioId, intensity, timeHorizon);
      const [narrative, actions] = await Promise.all([
        generateScenarioNarrative(result),
        generateDBActions(result),
      ]);

      return NextResponse.json({
        result,
        narrative,
        actions,
        timestamp: new Date().toISOString(),
      });
    }

    // Return all scenario definitions
    return NextResponse.json({
      scenarios: SCENARIO_DEFINITIONS,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Simulator API error:", error);
    return NextResponse.json({ error: "Simulation failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.custom) {
      const result = runCustomSimulation(body.params, body.intensity || 1.0);
      const [narrative, actions] = await Promise.all([
        generateScenarioNarrative(result),
        generateDBActions(result),
      ]);
      return NextResponse.json({ result, narrative, actions });
    }

    const result = runSimulation(body.scenarioId, body.intensity || 1.0, body.timeHorizon || "12M");
    const [narrative, actions] = await Promise.all([
      generateScenarioNarrative(result),
      generateDBActions(result),
    ]);
    return NextResponse.json({ result, narrative, actions });
  } catch (error) {
    console.error("Simulator POST error:", error);
    return NextResponse.json({ error: "Simulation failed" }, { status: 500 });
  }
}
