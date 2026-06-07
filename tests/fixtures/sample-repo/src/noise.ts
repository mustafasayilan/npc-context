export function renderReportTable(rows: Array<Record<string, string>>) {
  return rows.map((row) => Object.values(row).join(",")).join("\n");
}

export function exportCsv(rows: Array<Record<string, string>>) {
  return renderReportTable(rows);
}
