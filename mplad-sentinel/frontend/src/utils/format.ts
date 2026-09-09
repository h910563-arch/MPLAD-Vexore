export function formatLakh(value: number): string {
  return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 1 })}L`;
}

export function formatCrore(lakhValue: number): string {
  const crore = lakhValue / 100;
  return `₹${crore.toLocaleString("en-IN", { maximumFractionDigits: crore < 10 ? 2 : 1 })} Cr`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function formatNumber(n: number): string {
  return n.toLocaleString("en-IN");
}

export const STATUS_LABELS: Record<string, string> = {
  ONGOING: "Ongoing",
  COMPLETED: "Completed",
  DELAYED: "Delayed",
  NOT_STARTED: "Not started",
};

export const ANOMALY_LABELS: Record<string, string> = {
  COST: "Cost anomaly",
  DELAY: "Delay anomaly",
  EXPENDITURE: "Expenditure mismatch",
  SIMILARITY: "Similar project",
};
