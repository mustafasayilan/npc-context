import { basename } from "node:path";
import { MANIFESTS } from "./constants.js";
const STOP_WORDS = new Set([
    "about",
    "after",
    "and",
    "bir",
    "bug",
    "can",
    "code",
    "dosya",
    "fix",
    "for",
    "from",
    "gibi",
    "ile",
    "icin",
    "için",
    "make",
    "olan",
    "the",
    "this",
    "that",
    "with",
    "yap",
    "yeni"
]);
export function taskTerms(task) {
    const terms = new Set();
    for (const match of task.matchAll(/[\p{L}_][\p{L}\p{N}_.-]{2,}/gu)) {
        const raw = match[0].toLowerCase();
        if (!STOP_WORDS.has(raw)) {
            terms.add(raw);
            for (const part of raw.split(/[_.-]/)) {
                if (part.length > 2 && !STOP_WORDS.has(part))
                    terms.add(part);
            }
        }
    }
    return terms;
}
export function scoreFile(record, terms, changed, untracked) {
    const lowerPath = record.path.toLowerCase();
    const haystack = [
        lowerPath,
        record.role,
        record.snippet.toLowerCase(),
        record.symbols.map((symbol) => symbol.name).join(" ").toLowerCase(),
        record.routes.join(" ").toLowerCase(),
        record.imports.join(" ").toLowerCase()
    ].join(" ");
    let score = 0;
    if (changed.has(record.path))
        score += 35;
    if (untracked.has(record.path))
        score += 25;
    for (const term of terms) {
        if (lowerPath.includes(term))
            score += 8;
        if (haystack.includes(term))
            score += 4;
    }
    if (record.role === "manifest")
        score += 2;
    if (MANIFESTS.has(basename(record.path)))
        score += 2;
    if (terms.has("test") || terms.has("tests")) {
        if (record.role === "test")
            score += 12;
    }
    if (terms.has("api") || terms.has("route") || terms.has("endpoint")) {
        score += record.routes.length > 0 ? 12 : 0;
    }
    return score;
}
export function selectRelevantFiles(files, terms, changedFiles, untrackedFiles, maxFiles) {
    const changed = new Set(changedFiles.map((file) => file.replace(/\\/g, "/")));
    const untracked = new Set(untrackedFiles.map((file) => file.replace(/\\/g, "/")));
    const scored = files.map((file) => ({
        file,
        score: scoreFile(file, terms, changed, untracked)
    }));
    const ranked = scored.sort((a, b) => {
        const scoreDelta = b.score - a.score;
        return scoreDelta || a.file.path.localeCompare(b.file.path);
    });
    const bestScore = ranked[0]?.score ?? 0;
    const threshold = bestScore >= 20 ? Math.max(4, Math.floor(bestScore * 0.25)) : 1;
    const selected = ranked
        .filter((entry) => entry.score >= threshold)
        .map((entry) => entry.file)
        .slice(0, maxFiles);
    if (selected.length > 0)
        return selected;
    return ranked
        .map((entry) => entry.file)
        .slice(0, Math.min(maxFiles, 14));
}
//# sourceMappingURL=rank.js.map