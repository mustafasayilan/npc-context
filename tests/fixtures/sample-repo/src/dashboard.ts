export interface DashboardMetric {
  label: string;
  value: number;
  trend: "up" | "down" | "flat";
}

export function sortDashboardMetrics(metrics: DashboardMetric[]): DashboardMetric[] {
  return [...metrics].sort((left, right) => left.label.localeCompare(right.label));
}

export function findPositiveTrends(metrics: DashboardMetric[]): DashboardMetric[] {
  return metrics.filter((metric) => metric.trend === "up");
}

export function totalMetricValue(metrics: DashboardMetric[]): number {
  return metrics.reduce((total, metric) => total + metric.value, 0);
}
