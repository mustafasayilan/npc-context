export interface NotificationTemplate {
  id: string;
  subject: string;
  body: string;
}

export function renderNotification(template: NotificationTemplate, variables: Record<string, string>): string {
  return Object.entries(variables).reduce(
    (body, [key, value]) => body.replaceAll(`{{${key}}}`, value),
    template.body
  );
}

export function shouldSendDigest(lastSentAt: Date, now = new Date()): boolean {
  const oneDayMs = 24 * 60 * 60 * 1000;
  return now.getTime() - lastSentAt.getTime() >= oneDayMs;
}

export function normalizeEmailAddress(email: string): string {
  return email.trim().toLowerCase();
}
