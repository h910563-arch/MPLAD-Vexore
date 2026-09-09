import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Project } from "../types";
import { formatDate } from "../utils/format";

export default function ProjectTimeline({ project }: { project: Project }) {
  const today = new Date("2026-09-09");
  const isDelayed = project.status === "DELAYED";

  const steps = [
    { label: "Recommended", date: project.recommendationDate, done: true },
    { label: "Sanctioned", date: project.sanctionDate, done: true },
    { label: "Work started", date: project.workStartedDate, done: !!project.workStartedDate },
    {
      label: "Current progress",
      date: today.toISOString().slice(0, 10),
      done: true,
      detail: `${project.progressPercentage}% complete`,
    },
    {
      label: "Expected completion",
      date: project.expectedCompletionDate,
      done: project.status === "COMPLETED",
      alert: isDelayed,
    },
  ];

  return (
    <div className="relative pl-1">
      {steps.map((step, i) => (
        <motion.div
          key={step.label}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, delay: i * 0.08 }}
          className="relative flex gap-4 pb-7 last:pb-0"
        >
          {i < steps.length - 1 && (
            <div className="absolute left-[13px] top-6 h-full w-px bg-[var(--color-border)]" />
          )}
          <div
            className={`z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 ${
              step.alert
                ? "border-[var(--color-red)] bg-[var(--color-red-soft)]"
                : step.done
                ? "border-[var(--color-indigo)] bg-[var(--color-indigo)]"
                : "border-[var(--color-border)] bg-[var(--color-paper)]"
            }`}
          >
            {step.done && !step.alert && <Check className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />}
            {step.alert && <span className="h-2 w-2 rounded-full bg-[var(--color-red)]" />}
          </div>
          <div className="pt-0.5">
            <p className="text-sm font-medium text-[var(--color-ink)]">{step.label}</p>
            <p className="text-xs text-[var(--color-ink-faint)]">
              {step.date ? formatDate(step.date) : "Not yet started"}
              {step.detail ? ` · ${step.detail}` : ""}
              {step.alert ? " · behind schedule" : ""}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
