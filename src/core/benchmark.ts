import { join } from "node:path";
import { readTextIfExists, utcNow, writeText } from "./fs-utils.js";
import { buildIndex, createContext } from "./context.js";
import { estimateTokens, percentSavings } from "./token-estimator.js";
import type { BenchmarkResult } from "./types.js";

export async function runBenchmark(root: string, prompt: string): Promise<BenchmarkResult> {
  const index = await buildIndex(root, prompt);
  let baselineEstimatedTokens = 0;
  for (const file of Object.keys(index.files)) {
    const text = await readTextIfExists(join(root, file));
    baselineEstimatedTokens += estimateTokens(text);
  }
  const context = await createContext({ root, task: prompt, maxFiles: 20 });
  const result: BenchmarkResult = {
    prompt,
    root,
    generatedAt: utcNow(),
    candidateFiles: Object.keys(index.files).length,
    selectedFiles: context.selectedFiles.length,
    baselineEstimatedTokens,
    npcContextEstimatedTokens: context.estimatedContextTokens,
    estimatedSavingsPercent: percentSavings(baselineEstimatedTokens, context.estimatedContextTokens),
    notes: [
      "Token counts are local estimates, not provider billing guarantees.",
      "Baseline means all candidate text files that an agent might broadly inspect.",
      "NPC Context means the generated task-context.md file."
    ]
  };
  await writeText(join(root, ".npc-context", "benchmark-results.json"), JSON.stringify(result, null, 2));
  await writeText(
    join(root, ".npc-context", "benchmark-results.md"),
    [
      "# NPC Context Benchmark",
      `Generated: ${result.generatedAt}`,
      `Prompt: ${result.prompt}`,
      "",
      `- Candidate files: ${result.candidateFiles}`,
      `- Selected files: ${result.selectedFiles}`,
      `- Baseline estimated tokens: ${result.baselineEstimatedTokens}`,
      `- NPC Context estimated tokens: ${result.npcContextEstimatedTokens}`,
      `- Estimated savings: ${result.estimatedSavingsPercent}%`,
      "",
      "These are local estimates for comparison only. They are not billing guarantees."
    ].join("\n") + "\n"
  );
  return result;
}
