import { cp, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { runBenchmark } from "../dist/index.js";

const root = await mkdtemp(join(tmpdir(), "npc-context-benchmark-"));

try {
  await cp(resolve("tests/fixtures/sample-repo"), root, { recursive: true });
  const result = await runBenchmark(root, "add a simple settings panel");
  console.log(JSON.stringify(result, null, 2));
} finally {
  await rm(root, { recursive: true, force: true });
}
