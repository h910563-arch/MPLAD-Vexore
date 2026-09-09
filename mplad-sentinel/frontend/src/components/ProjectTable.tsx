import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { ProjectWithRisk } from "../types";
import RiskBadge from "./RiskBadge";
import StatusBadge from "./StatusBadge";
import { formatLakh } from "../utils/format";

const COLUMNS = ["Project", "Type", "District", "Cost", "Progress", "Expenditure", "Status", "Risk", ""];

export default function ProjectTable({ projects }: { projects: ProjectWithRisk[] }) {
  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)] md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-ivory-soft)]/60">
              {COLUMNS.map((c) => (
                <th key={c} className="px-5 py-3 text-xs font-medium tracking-wide text-[var(--color-ink-soft)]">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {projects.map((p, i) => (
              <motion.tr
                key={p.projectId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.4) }}
                className="group border-b border-[var(--color-border-soft)] last:border-0 hover:bg-[var(--color-ivory-soft)]/50"
              >
                <td className="px-5 py-3.5">
                  <Link to={`/projects/${p.projectId}`} className="block">
                    <p className="font-medium text-[var(--color-ink)] group-hover:text-[var(--color-indigo)]">
                      {p.projectName}
                    </p>
                    <p className="font-mono text-[11px] text-[var(--color-ink-faint)]">{p.projectId}</p>
                  </Link>
                </td>
                <td className="px-5 py-3.5 text-[var(--color-ink-soft)]">{p.projectType}</td>
                <td className="px-5 py-3.5 text-[var(--color-ink-soft)]">{p.district}</td>
                <td className="px-5 py-3.5 font-mono text-[var(--color-ink)]">{formatLakh(p.cost)}</td>
                <td className="px-5 py-3.5 text-[var(--color-ink-soft)]">{p.progressPercentage}%</td>
                <td className="px-5 py-3.5 text-[var(--color-ink-soft)]">{p.expenditurePercentage}%</td>
                <td className="px-5 py-3.5">
                  <StatusBadge status={p.status} />
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <RiskBadge level={p.risk.riskLevel} size="sm" />
                    <span className="font-mono text-xs text-[var(--color-ink-faint)]">{p.risk.riskScore}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <Link
                    to={`/projects/${p.projectId}`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-indigo)] opacity-0 transition group-hover:opacity-100"
                  >
                    View <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {projects.map((p, i) => (
          <motion.div
            key={p.projectId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.4) }}
          >
            <Link
              to={`/projects/${p.projectId}`}
              className="block rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-[var(--color-ink)]">{p.projectName}</p>
                  <p className="text-xs text-[var(--color-ink-faint)]">
                    {p.district} · {p.projectType}
                  </p>
                </div>
                <RiskBadge level={p.risk.riskLevel} size="sm" />
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-[var(--color-ink-soft)]">
                <span className="font-mono">{formatLakh(p.cost)}</span>
                <span>{p.progressPercentage}% progress</span>
                <StatusBadge status={p.status} />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </>
  );
}
