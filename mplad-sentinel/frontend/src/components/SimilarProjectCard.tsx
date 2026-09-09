import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { SimilarProject } from "../types";
import { formatLakh } from "../utils/format";

export default function SimilarProjectCard({ item, index = 0 }: { item: SimilarProject; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
    >
      <Link
        to={`/projects/${item.projectId}`}
        className="block rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)] p-4 transition hover:border-[var(--color-indigo-line)] hover:shadow-[0_2px_16px_-4px_rgba(27,35,51,0.08)]"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[var(--color-ink)]">{item.projectName}</p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-[var(--color-ink-faint)]">
              <MapPin className="h-3 w-3" /> {item.district} · {item.distanceKm} km away
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-[var(--color-indigo-soft)] px-2.5 py-1 font-mono text-xs font-semibold text-[var(--color-indigo)]">
            {item.similarity}%
          </span>
        </div>
        <p className="mt-2.5 text-xs text-[var(--color-ink-soft)]">{formatLakh(item.cost)} sanctioned</p>
      </Link>
    </motion.div>
  );
}
