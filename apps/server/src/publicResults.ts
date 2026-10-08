type ReleasedScenario = { scenarioHash: string };

/** Public readers can only see runs whose frozen questions belong to the released bank. */
export function isPublicRun(
  manifestRaw: string | null,
  resultScenarioIds: string[],
  released: ReadonlyMap<string, ReleasedScenario>,
): boolean {
  if (manifestRaw) {
    let manifest: { benchmarkPack?: { scenarios?: Array<{ id: string; scenarioHash?: string }> } };
    try {
      manifest = JSON.parse(manifestRaw);
    } catch {
      return false;
    }
    if (Object.hasOwn(manifest, 'benchmarkPack')) {
      const scenarios = manifest.benchmarkPack?.scenarios;
      if (!Array.isArray(scenarios) || scenarios.length === 0) return false;
      return scenarios.every(scenario => released.get(scenario.id)?.scenarioHash === scenario.scenarioHash);
    }
  }

  const ids = [...new Set(resultScenarioIds)];
  return ids.length > 0 && ids.every(id => released.has(id));
}
