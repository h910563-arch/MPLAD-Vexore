import { motion } from "framer-motion";

interface Props {
  value: number;
  label: string;
  tone?: "indigo" | "amber" | "green";
  showValue?: boolean;
}

const TONES: Record<string, string> = {
  indigo: "var(--color-indigo)",
  amber: "var(--color-amber)",
  green: "var(--color-green)",
};

export default function ProgressBar({ value, label, tone = "indigo", showValue = true }: Props) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-xs font-medium text-[var(--color-ink-soft)]">{label}</span>
        {showValue && (
          <span className="font-mono text-xs font-medium text-[var(--color-ink)]">{clamped}%</span>
        )}
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-ivory-soft)]">
        <motion.div
          className="h-full rounded-full"
          style={{ background: TONES[tone] }}
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}
