import { IndianRupee, Clock, TrendingUp, Copy } from "lucide-react";
import { motion } from "framer-motion";
import { AnomalyReason } from "../types";
import { ANOMALY_LABELS } from "../utils/format";

const ICONS = {
  COST: IndianRupee,
  DELAY: Clock,
  EXPENDITURE: TrendingUp,
  SIMILARITY: Copy,
};

const SEVERITY_STYLES: Record<string, { border: string; bg: string; text: string }> = {
  HIGH: { border: "border-[var(--color-red-line)]", bg: "bg-[var(--color-red-soft)]", text: "text-[var(--color-red)]" },
  MEDIUM: { border: "border-[var(--color-amber-line)]", bg: "bg-[var(--color-amber-soft)]", text: "text-[var(--color-amber)]" },
  LOW: { border: "border-[var(--color-green-line)]", bg: "bg-[var(--color-green-soft)]", text: "text-[var(--color-green)]" },
};

export default function AnomalyCard({ reason, index = 0 }: { reason: AnomalyReason; index?: number }) {
  const Icon = ICONS[reason.type];
  const style = SEVERITY_STYLES[reason.severity];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07 }}
      className={`rounded-2xl border p-5 ${style.border} bg-[var(--color-paper)]`}
    >
      <div className="flex items-start gap-3.5">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${style.bg}`}>
          <Icon className={`h-4 w-4 ${style.text}`} strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-[var(--color-ink)]">{ANOMALY_LABELS[reason.type]}</p>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${style.bg} ${style.text}`}>
              {reason.severity}
            </span>
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-ink-soft)]">{reason.message}</p>
          {reason.data && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {Object.entries(reason.data).map(([k, v]) => (
                <span
                  key={k}
                  className="rounded-md bg-[var(--color-ivory-soft)] px-2 py-1 font-mono text-[11px] text-[var(--color-ink-soft)]"
                >
                  {String(v)}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
