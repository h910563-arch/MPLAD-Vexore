import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { RiskLevel } from "../types";

const COLORS: Record<RiskLevel, string> = {
  LOW: "var(--color-green)",
  MEDIUM: "var(--color-amber)",
  HIGH: "var(--color-red)",
};

export default function RiskGauge({ score, level }: { score: number; level: RiskLevel }) {
  const [display, setDisplay] = useState(0);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    let raf: number;
    let start: number | null = null;
    const duration = 1200;
    const step = (t: number) => {
      if (start === null) start = t;
      const progress = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(score * eased));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  const offset = circumference - (display / 100) * circumference;

  return (
    <div className="relative flex h-36 w-36 items-center justify-center">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="var(--color-ivory-soft)" strokeWidth="9" />
        <motion.circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={COLORS[level]}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transition={{ duration: 0 }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-mono text-3xl font-semibold text-[var(--color-ink)]">{display}</span>
        <span className="text-[11px] text-[var(--color-ink-faint)]">out of 100</span>
      </div>
    </div>
  );
}
