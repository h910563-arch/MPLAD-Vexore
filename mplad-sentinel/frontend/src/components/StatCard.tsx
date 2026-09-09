import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import AnimatedNumber from "./AnimatedNumber";

interface Props {
  label: string;
  value: number;
  format?: (n: number) => string;
  icon: LucideIcon;
  tone?: "default" | "alert";
  index?: number;
}

export default function StatCard({ label, value, format, icon: Icon, tone = "default", index = 0 }: Props) {
  const isAlert = tone === "alert";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className={`rounded-2xl border p-5 transition-shadow hover:shadow-[0_2px_20px_-4px_rgba(27,35,51,0.08)] ${
        isAlert
          ? "border-[var(--color-red-line)] bg-[var(--color-red-soft)]"
          : "border-[var(--color-border)] bg-[var(--color-paper)]"
      }`}
    >
      <div className="flex items-start justify-between">
        <p
          className={`text-xs font-medium tracking-wide ${
            isAlert ? "text-[var(--color-red)]" : "text-[var(--color-ink-soft)]"
          }`}
        >
          {label}
        </p>
        <Icon
          className={`h-4 w-4 ${isAlert ? "text-[var(--color-red)]" : "text-[var(--color-ink-faint)]"}`}
          strokeWidth={1.6}
        />
      </div>
      <p
        className={`mt-3 font-[var(--font-display)] text-[28px] font-semibold leading-none ${
          isAlert ? "text-[var(--color-red)]" : "text-[var(--color-ink)]"
        }`}
      >
        <AnimatedNumber value={value} format={format} />
      </p>
    </motion.div>
  );
}
