export function estimateTokens(text: string): number {
  if (!text) return 0;
  const compactChars = text.replace(/\s+/g, " ").length;
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(Math.ceil(compactChars / 4), Math.ceil(wordCount * 1.33));
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function percentSavings(baseline: number, optimized: number): number {
  if (baseline <= 0) return 0;
  return Math.max(0, Math.min(100, Number((((baseline - optimized) / baseline) * 100).toFixed(1))));
}
