import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { runBenchmark } from "../dist/index.js";

const domains = [
  "settings",
  "billing",
  "inventory",
  "notifications",
  "audit",
  "search",
  "profile",
  "dashboard",
  "reports",
  "webhooks",
  "permissions",
  "projects",
  "comments",
  "analytics",
  "integrations",
  "teams"
];

const prompts = [
  "add a simple settings panel",
  "fix invoice total rounding bug",
  "add search result ranking by tag",
  "update webhook retry handling",
  "add permission audit export"
];

async function writeText(root, relativePath, content) {
  const fullPath = join(root, relativePath);
  await mkdir(dirname(fullPath), { recursive: true });
  await writeFile(fullPath, content, "utf8");
}

function titleCase(value) {
  return value.replace(/(^|[-_])([a-z])/g, (_, prefix, letter) => `${prefix}${letter.toUpperCase()}`).replace(/[-_]/g, "");
}

function serviceFile(domain) {
  const typeName = titleCase(domain);
  return `
export interface ${typeName}Record {
  id: string;
  ownerId: string;
  status: "draft" | "active" | "archived";
  tags: string[];
  updatedAt: string;
}

export function list${typeName}Records(records: ${typeName}Record[]): ${typeName}Record[] {
  return records.filter((record) => record.status !== "archived");
}

export function find${typeName}ByTag(records: ${typeName}Record[], tag: string): ${typeName}Record[] {
  return records.filter((record) => record.tags.includes(tag));
}

export function update${typeName}Status(record: ${typeName}Record, status: ${typeName}Record["status"]): ${typeName}Record {
  return { ...record, status, updatedAt: new Date().toISOString() };
}

export function summarize${typeName}Records(records: ${typeName}Record[]): Record<string, number> {
  return records.reduce<Record<string, number>>((summary, record) => {
    summary[record.status] = (summary[record.status] ?? 0) + 1;
    return summary;
  }, {});
}
`.trimStart();
}

function apiFile(domain) {
  const typeName = titleCase(domain);
  return `
import { list${typeName}Records, update${typeName}Status } from "./service";

export function register${typeName}Routes(router: { get: Function; post: Function; patch: Function }) {
  router.get("/api/${domain}", async (_request: unknown, response: { json: Function }) => {
    response.json(list${typeName}Records([]));
  });

  router.post("/api/${domain}", async (request: { body: any }, response: { json: Function }) => {
    response.json(request.body);
  });

  router.patch("/api/${domain}/:id", async (request: { body: any }, response: { json: Function }) => {
    response.json(update${typeName}Status(request.body, "active"));
  });
}
`.trimStart();
}

function testFile(domain) {
  const typeName = titleCase(domain);
  return `
import { list${typeName}Records, summarize${typeName}Records } from "./service";

export function test${typeName}Listing() {
  const records = list${typeName}Records([]);
  if (!Array.isArray(records)) throw new Error("${domain} records must be an array");
}

export function test${typeName}Summary() {
  const summary = summarize${typeName}Records([]);
  if (typeof summary !== "object") throw new Error("${domain} summary must be an object");
}
`.trimStart();
}

async function createRepository(root) {
  await writeText(
    root,
    "package.json",
    JSON.stringify(
      {
        name: "realistic-saas-fixture",
        version: "1.0.0",
        private: true,
        scripts: { test: "node --test", build: "tsc --noEmit" },
        dependencies: { express: "^4.18.0", react: "^18.2.0", vite: "^5.0.0" },
        devDependencies: { typescript: "^5.7.2" }
      },
      null,
      2
    )
  );
  await writeText(root, "tsconfig.json", JSON.stringify({ compilerOptions: { strict: true } }, null, 2));
  await writeText(
    root,
    "README.md",
    "# Realistic SaaS Fixture\n\nA generated multi-domain TypeScript application used for NPC Context benchmarks.\n"
  );
  for (const domain of domains) {
    await writeText(root, `src/features/${domain}/service.ts`, serviceFile(domain));
    await writeText(root, `src/features/${domain}/api.ts`, apiFile(domain));
    await writeText(root, `src/features/${domain}/service.test.ts`, testFile(domain));
    await writeText(root, `docs/${domain}.md`, `# ${titleCase(domain)}\n\nOperational notes for ${domain} workflows.\n`);
  }
  await writeText(
    root,
    "src/app.ts",
    domains.map((domain) => `export * from "./features/${domain}/service";`).join("\n") + "\n"
  );

  const git = spawnSync("git", ["init"], { cwd: root, stdio: "ignore" });
  if (git.status === 0) {
    spawnSync("git", ["config", "user.email", "benchmark@example.com"], { cwd: root, stdio: "ignore" });
    spawnSync("git", ["config", "user.name", "NPC Benchmark"], { cwd: root, stdio: "ignore" });
    spawnSync("git", ["add", "."], { cwd: root, stdio: "ignore" });
    spawnSync("git", ["commit", "-m", "Initial benchmark fixture"], { cwd: root, stdio: "ignore" });
  }
}

const root = await mkdtemp(join(tmpdir(), "npc-context-realistic-"));

try {
  await createRepository(root);
  const results = [];
  for (const prompt of prompts) {
    results.push(await runBenchmark(root, prompt));
  }
  const averageSavings =
    results.reduce((total, result) => total + result.estimatedSavingsPercent, 0) / results.length;
  const summary = {
    generatedAt: new Date().toISOString().replace(/\.\d{3}Z$/, "Z"),
    repositoryShape: {
      domains: domains.length,
      prompts: prompts.length,
      filesPerDomain: 4
    },
    averageEstimatedSavingsPercent: Number(averageSavings.toFixed(1)),
    results: results.map((result) => ({
      prompt: result.prompt,
      candidateFiles: result.candidateFiles,
      selectedFiles: result.selectedFiles,
      baselineEstimatedTokens: result.baselineEstimatedTokens,
      npcContextEstimatedTokens: result.npcContextEstimatedTokens,
      estimatedSavingsPercent: result.estimatedSavingsPercent
    })),
    notes: [
      "Synthetic fixture generated locally to model a multi-domain TypeScript SaaS repository.",
      "Token counts are local estimates for comparison only, not API billing guarantees."
    ]
  };
  console.log(JSON.stringify(summary, null, 2));
} finally {
  await rm(root, { recursive: true, force: true });
}
