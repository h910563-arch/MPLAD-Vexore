import { motion } from "framer-motion";
import { useFetch } from "../hooks/useFetch";
import { api } from "../services/api";
import PriorityCard from "../components/PriorityCard";
import { CardSkeleton, ErrorState, EmptyState } from "../components/States";

export default function HighRisk() {
  const { data, loading, error, refetch } = useFetch(() => api.getHighRiskProjects(20), []);

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="font-[var(--font-display)] text-[28px] font-semibold text-[var(--color-ink)]">Priority Review</h1>
        <p className="mt-1.5 text-sm text-[var(--color-ink-soft)]">
          Every project currently carrying a medium or high anomaly signal, ranked by risk score.
        </p>
      </motion.div>

      <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading && Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        {error && (
          <div className="col-span-full">
            <ErrorState message={error} onRetry={refetch} />
          </div>
        )}
        {data && data.projects.length === 0 && (
          <div className="col-span-full">
            <EmptyState title="No projects need review right now" description="All monitored projects currently fall within expected patterns." />
          </div>
        )}
        {data?.projects.map((p, i) => (
          <PriorityCard key={p.projectId} item={p} index={i} />
        ))}
      </div>
    </div>
  );
}
