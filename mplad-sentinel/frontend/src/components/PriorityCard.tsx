import { motion } from "framer-motion";
import { MapPin, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { ProjectWithRisk } from "../types";
import RiskBadge from "./RiskBadge";
import { formatLakh } from "../utils/format";

export default function PriorityCard({ item, index = 0 }: { item: ProjectWithRisk; index?: number }) {
  const topReason = [...item.risk.reasons].sort((a, b) => b.score - a.score)[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2 }}
      className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)] p-5 transition-shadow hover:shadow-[0_4px_24px_-6px_rgba(27,35,51,0.1)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-[var(--font-display)] text-lg font-medium text-[var(--color-ink)]">{item.projectName}</p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-[var(--color-ink-faint)]">
            <MapPin className="h-3 w-3" /> {item.district}
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-2xl font-semibold text-[var(--color-ink)]">{item.risk.riskScore}</p>
          <p className="text-[10px] text-[var(--color-ink-faint)]">/ 100</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4 text-sm">
        <span className="font-mono text-[var(--color-ink-soft)]">{formatLakh(item.cost)}</span>
        <span className="text-[var(--color-ink-soft)]">{item.progressPercentage}% progress</span>
      </div>

      <div className="mt-4">
        <RiskBadge level={item.risk.riskLevel} />
      </div>

      <ul className="mt-4 space-y-1.5">
        {item.risk.reasons.slice(0, 3).map((r) => (
          <li key={r.type} className="flex items-start gap-2 text-xs text-[var(--color-ink-soft)]">
            <span
              className={`mt-1 h-1 w-1 shrink-0 rounded-full ${
                r === topReason ? "bg-[var(--color-red)]" : "bg-[var(--color-ink-faint)]"
              }`}
            />
            {r.message}
          </li>
        ))}
      </ul>

      <Link
        to={`/projects/${item.projectId}`}
        className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-indigo)]"
      >
        View analysis <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </motion.div>
  );
}
