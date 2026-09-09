import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, LineChart, ScanSearch } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PILLARS = [
  { icon: ScanSearch, label: "Detect", detail: "Surfaces unusual cost, delay and spending patterns." },
  { icon: LineChart, label: "Prioritize", detail: "Ranks projects by an explainable risk score." },
  { icon: ShieldCheck, label: "Review", detail: "Keeps every judgment with the officer, not the system." },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--color-ivory)] px-6">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(27,35,51,0.08) 1px, transparent 0)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse 60% 50% at 50% 40%, black 20%, transparent 75%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-lg text-center"
      >
        <div className="mx-auto mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-ink)]">
          <svg viewBox="0 0 32 32" className="h-7 w-7">
            <path
              d="M8 21 L13 11 L16 17 L19 9 L24 21"
              fill="none"
              stroke="#EDE7D6"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <p className="text-xs font-medium tracking-[0.1em] text-[var(--color-ink-faint)]">
          PROTOTYPE FOR SIH · PUBLIC INFRASTRUCTURE INTELLIGENCE
        </p>

        <h1 className="mt-4 font-[var(--font-display)] text-5xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-6xl">
          MPLAD Vexore
        </h1>

        <p className="mx-auto mt-4 max-w-sm text-[15px] leading-relaxed text-[var(--color-ink-soft)]">
          AI-assisted monitoring for smarter public infrastructure. It flags MPLADS projects
          worth a closer look, and explains exactly why.
        </p>

        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/dashboard")}
          className="mt-9 inline-flex items-center gap-2 rounded-full bg-[var(--color-ink)] px-6 py-3.5 text-sm font-medium text-[var(--color-ivory)] shadow-[0_8px_30px_-8px_rgba(27,35,51,0.4)] transition hover:bg-[#0f1524]"
        >
          Enter Monitoring Dashboard
          <ArrowRight className="h-4 w-4" />
        </motion.button>

        <div className="mx-auto mt-14 grid max-w-md grid-cols-3 gap-6 border-t border-[var(--color-border)] pt-8 text-left">
          {PILLARS.map(({ icon: Icon, label, detail }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
            >
              <Icon className="h-4 w-4 text-[var(--color-indigo)]" strokeWidth={1.75} />
              <p className="mt-2 text-sm font-medium text-[var(--color-ink)]">{label}</p>
              <p className="mt-0.5 text-xs leading-snug text-[var(--color-ink-faint)]">{detail}</p>
            </motion.div>
          ))}
        </div>

        <p className="mt-10 text-[11px] text-[var(--color-ink-faint)]">
          Demo access only — no authentication is implemented in this prototype.
        </p>
      </motion.div>
    </div>
  );
}
