export interface AuditEvent {
  actorId: string;
  action: string;
  resourceId: string;
  createdAt: string;
}

export function recordAuditEvent(events: AuditEvent[], event: AuditEvent): AuditEvent[] {
  return [...events, event];
}

export function filterAuditEventsByActor(events: AuditEvent[], actorId: string): AuditEvent[] {
  return events.filter((event) => event.actorId === actorId);
}

export function summarizeAuditTrail(events: AuditEvent[]): Record<string, number> {
  return events.reduce<Record<string, number>>((summary, event) => {
    summary[event.action] = (summary[event.action] ?? 0) + 1;
    return summary;
  }, {});
}
