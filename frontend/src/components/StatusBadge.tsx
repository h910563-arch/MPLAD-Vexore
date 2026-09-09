import { ProjectStatus } from "../types";
import { STATUS_LABELS } from "../utils/format";

const STYLES: Record<ProjectStatus, string> = {
  ONGOING: "bg-[var(--color-indigo-soft)] text-[var(--color-indigo)] border-[var(--color-indigo-line)]",
  COMPLETED: "bg-[var(--color-green-soft)] text-[var(--color-green)] border-[var(--color-green-line)]",
  DELAYED: "bg-[var(--color-amber-soft)] text-[var(--color-amber)] border-[var(--color-amber-line)]",
  NOT_STARTED: "bg-[var(--color-ivory-soft)] text-[var(--color-ink-soft)] border-[var(--color-border)]",
};

export default function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
