export interface Invoice {
  id: string;
  accountId: string;
  status: "draft" | "sent" | "paid" | "void";
  amountCents: number;
}

export function calculateInvoiceTotal(invoices: Invoice[]): number {
  return invoices.reduce((total, invoice) => total + invoice.amountCents, 0);
}

export function listOverdueInvoices(invoices: Invoice[]): Invoice[] {
  return invoices.filter((invoice) => invoice.status === "sent");
}

export function markInvoicePaid(invoice: Invoice): Invoice {
  return { ...invoice, status: "paid" };
}

export function formatInvoiceAmount(invoice: Invoice): string {
  return `$${(invoice.amountCents / 100).toFixed(2)}`;
}
