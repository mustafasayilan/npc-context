import { stat } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import { MANIFESTS } from "./constants.js";
import { readText, sha1 } from "./fs-utils.js";
import type { FileSummary, SymbolHint } from "./types.js";

const SYMBOL_PATTERNS: Array<{ kind: string; pattern: RegExp }> = [
  {
    kind: "type",
    pattern:
      /^\s*(?:export\s+)?(?:default\s+)?(?:abstract\s+)?(?:class|interface|type|enum|struct|record)\s+([A-Za-z_$][\w$]*)/
  },
  {
    kind: "function",
    pattern: /^\s*(?:export\s+)?(?:default\s+)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/
  },
  {
    kind: "function",
    pattern: /^\s*(?:export\s+)?(?:async\s+)?def\s+([A-Za-z_$][\w$]*)/
  },
  {
    kind: "variable",
    pattern: /^\s*(?:export\s+)?(?:const|let|var)\s+([A-Za-z_$][\w$]*)/
  },
  {
    kind: "member",
    pattern:
      /^\s*(?:public|private|protected|internal|static|async|override|virtual|sealed|\s)+\s*[\w<>,\[\]?]+\s+([A-Za-z_$][\w$]*)\s*\(/
  }
];

const ROUTE_PATTERNS = [
  /(?:app|router|server)\.(?:get|post|put|patch|delete|use)\s*\(\s*["'`]([^"'`]+)["'`]/g,
  /(?:Route|HttpGet|HttpPost|HttpPut|HttpPatch|HttpDelete)\s*\(\s*["']?([^"')]+)["']?\s*\)/g,
  /\bpath\s*:\s*["'`]([^"'`]+)["'`]/g
];

const IMPORT_PATTERNS = [
  /^\s*import\s+.*?\s+from\s+["']([^"']+)["']/,
  /^\s*import\s+["']([^"']+)["']/,
  /^\s*const\s+.+?\s*=\s*require\(["']([^"']+)["']\)/,
  /^\s*using\s+([A-Za-z0-9_.]+);/
];

function roleForPath(relativePath: string): string {
  const lower = relativePath.toLowerCase();
  const name = basename(relativePath);
  if (MANIFESTS.has(name)) return "manifest";
  if (lower.includes("/test/") || lower.includes("/tests/") || /\.(test|spec)\.[cm]?[jt]sx?$/.test(lower)) return "test";
  if (lower.includes("/docs/") || lower.endsWith(".md")) return "docs";
  if (lower.includes("/scripts/")) return "script";
  if (/\.(json|ya?ml|toml|xml)$/.test(lower)) return "config";
  return "source";
}

export async function summarizeFile(root: string, relativePath: string): Promise<FileSummary | undefined> {
  const fullPath = join(root, relativePath);
  let text: string;
  let info;
  try {
    [text, info] = await Promise.all([readText(fullPath), stat(fullPath)]);
  } catch {
    return undefined;
  }
  const lines = text.split(/\r?\n/);
  const symbols: SymbolHint[] = [];
  const routes: string[] = [];
  const imports: string[] = [];

  for (let index = 0; index < Math.min(lines.length, 5000); index += 1) {
    const line = lines[index] ?? "";
    for (const candidate of SYMBOL_PATTERNS) {
      const match = candidate.pattern.exec(line);
      if (match?.[1] && symbols.length < 40) {
        symbols.push({ name: match[1], line: index + 1, kind: candidate.kind });
        break;
      }
    }
    for (const pattern of ROUTE_PATTERNS) {
      pattern.lastIndex = 0;
      for (const match of line.matchAll(pattern)) {
        if (match[1] && routes.length < 30) routes.push(match[1].trim());
      }
    }
    for (const pattern of IMPORT_PATTERNS) {
      const match = pattern.exec(line);
      if (match?.[1] && imports.length < 30) imports.push(match[1].trim());
    }
  }

  return {
    path: relativePath.replace(/\\/g, "/"),
    bytes: info.size,
    mtimeMs: info.mtimeMs,
    sha1: sha1(text),
    lines: lines.length,
    role: roleForPath(relativePath),
    symbols,
    routes: [...new Set(routes)],
    imports: [...new Set(imports)],
    snippet: lines.find((line) => line.trim().length > 0)?.trim().slice(0, 220) ?? ""
  };
}

export function detectProjectTypes(files: string[], packageJson?: string): string[] {
  const names = new Set(files.map((file) => basename(file)));
  const extensions = new Set(files.map((file) => extname(file)));
  const result: string[] = [];
  if (names.has("package.json")) result.push("Node");
  if (names.has("pyproject.toml") || names.has("requirements.txt") || names.has("Pipfile")) result.push("Python");
  if (names.has("go.mod")) result.push("Go");
  if (names.has("Cargo.toml")) result.push("Rust");
  if (names.has("composer.json")) result.push("PHP");
  if (names.has("Gemfile")) result.push("Ruby");
  if (names.has("pom.xml") || names.has("build.gradle") || names.has("build.gradle.kts")) result.push("Java");
  if (extensions.has(".csproj") || extensions.has(".sln")) result.push(".NET");

  if (packageJson) {
    try {
      const parsed = JSON.parse(packageJson) as { dependencies?: Record<string, string>; devDependencies?: Record<string, string> };
      const dependencies = { ...(parsed.dependencies ?? {}), ...(parsed.devDependencies ?? {}) };
      for (const [name, label] of [
        ["next", "Next.js"],
        ["react", "React"],
        ["vue", "Vue"],
        ["svelte", "Svelte"],
        ["vite", "Vite"],
        ["express", "Express"],
        ["fastify", "Fastify"],
        ["@nestjs/core", "NestJS"]
      ] as const) {
        if (dependencies[name]) result.push(label);
      }
    } catch {
      // Ignore malformed package metadata; the file summary still lists it.
    }
  }
  return [...new Set(result)].sort().length ? [...new Set(result)].sort() : ["generic"];
}
