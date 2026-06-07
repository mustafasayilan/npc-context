export interface ReportDefinition {
  id: string;
  title: string;
  columns: string[];
}

export function createReportDefinition(id: string, title: string, columns: string[]): ReportDefinition {
  return { id, title, columns };
}

export function validateReportDefinition(report: ReportDefinition): boolean {
  return report.id.length > 0 && report.title.length > 0 && report.columns.length > 0;
}

export function describeReport(report: ReportDefinition): string {
  return `${report.title}: ${report.columns.join(", ")}`;
}
