import { RiskLevel } from "../types";

const STYLES: Record<RiskLevel, string> = {
  LOW: "bg-[var(--color-green-soft)] text-[var(--color-green)] border-[var(--color-green-line)]",
  MEDIUM: "bg-[var(--color-amber-soft)] text-[var(--color-amber)] border-[var(--color-amber-line)]",
  HIGH: "bg-[var(--color-red-soft)] text-[var(--color-red)] border-[var(--color-red-line)]",
};

const LABELS: Record<RiskLevel, string> = {
  LOW: "Low risk",
  MEDIUM: "Medium risk",
  HIGH: "High risk",
};

export default function RiskBadge({ level, size = "md" }: { level: RiskLevel; size?: "sm" | "md" | "lg" }) {
  const sizeClasses =
    size === "sm" ? "text-[11px] px-2 py-0.5" : size === "lg" ? "text-sm px-3.5 py-1.5" : "text-xs px-2.5 py-1";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium tracking-wide ${STYLES[level]} ${sizeClasses}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {LABELS[level]}
    </span>
  );
}
