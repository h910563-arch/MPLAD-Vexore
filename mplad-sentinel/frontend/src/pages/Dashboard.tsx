import { motion } from "framer-motion";
import { Files, Coins, CheckCircle2, Clock, ShieldAlert, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useFetch } from "../hooks/useFetch";
import { api } from "../services/api";
import StatCard from "../components/StatCard";
import PriorityCard from "../components/PriorityCard";
import RiskDistributionChart from "../components/charts/RiskDistributionChart";
import StatusDistributionChart from "../components/charts/StatusDistributionChart";
import DistrictBarChart from "../components/charts/DistrictBarChart";
import ExpenditureScatterChart from "../components/charts/ExpenditureScatterChart";
import { CardSkeleton, ChartSkeleton, ErrorState, EmptyState } from "../components/States";
import { formatCrore, formatNumber } from "../utils/format";

export default function Dashboard() {
  const stats = useFetch(() => api.getDashboardStats(), []);
  const highRisk = useFetch(() => api.getHighRiskProjects(3), []);
  const riskDist = useFetch(() => api.getRiskDistribution(), []);
  const statusDist = useFetch(() => api.getStatusDistribution(), []);
  const districtDist = useFetch(() => api.getDistrictDistribution(), []);
  const expenditure = useFetch(() => api.getExpenditureVsProgress(), []);

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="font-[var(--font-display)] text-[28px] font-semibold text-[var(--color-ink)]">
          Project Intelligence Overview
        </h1>
        <p className="mt-1.5 text-sm text-[var(--color-ink-soft)]">
          Monitor project progress, spending patterns and emerging risks across MPLADS.
        </p>
      </motion.div>

      {/* Stat cards */}
      <div className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-5">
        {stats.loading &&
          Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)}
        {stats.error && (
          <div className="col-span-full">
            <ErrorState message={stats.error} onRetry={stats.refetch} />
          </div>
        )}
        {stats.data && (
          <>
            <StatCard label="Total Projects" value={stats.data.totalProjects} format={formatNumber} icon={Files} index={0} />
            <StatCard
              label="Total Funds"
              value={stats.data.totalFundsLakh}
              format={(v) => formatCrore(v)}
              icon={Coins}
              index={1}
            />
            <StatCard label="Completed" value={stats.data.completed} format={formatNumber} icon={CheckCircle2} index={2} />
            <StatCard label="Delayed" value={stats.data.delayed} format={formatNumber} icon={Clock} index={3} />
            <StatCard
              label="High Risk"
              value={stats.data.highRisk}
              format={formatNumber}
              icon={ShieldAlert}
              tone="alert"
              index={4}
            />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ChartCard title="Project Status Distribution">
          {statusDist.loading && <ChartSkeleton />}
          {statusDist.error && <ErrorState message={statusDist.error} onRetry={statusDist.refetch} />}
          {statusDist.data && <StatusDistributionChart data={statusDist.data} />}
        </ChartCard>

        <ChartCard title="Risk Distribution">
          {riskDist.loading && <ChartSkeleton />}
          {riskDist.error && <ErrorState message={riskDist.error} onRetry={riskDist.refetch} />}
          {riskDist.data && <RiskDistributionChart data={riskDist.data} />}
        </ChartCard>

        <ChartCard title="Projects by District">
          {districtDist.loading && <ChartSkeleton />}
          {districtDist.error && <ErrorState message={districtDist.error} onRetry={districtDist.refetch} />}
          {districtDist.data && <DistrictBarChart data={districtDist.data} />}
        </ChartCard>

        <ChartCard title="Expenditure vs Progress" subtitle="Points above the diagonal have spent more than they've built.">
          {expenditure.loading && <ChartSkeleton />}
          {expenditure.error && <ErrorState message={expenditure.error} onRetry={expenditure.refetch} />}
          {expenditure.data && <ExpenditureScatterChart data={expenditure.data} />}
        </ChartCard>
      </div>

      {/* Priority review */}
      <div className="mt-10">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-[var(--font-display)] text-xl font-semibold text-[var(--color-ink)]">
              Priority Review
            </h2>
            <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
              Projects with the strongest anomaly signals.
            </p>
          </div>
          <Link
            to="/high-risk"
            className="hidden items-center gap-1.5 text-sm font-medium text-[var(--color-indigo)] sm:inline-flex"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          {highRisk.loading &&
            Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
          {highRisk.error && (
            <div className="col-span-full">
              <ErrorState message={highRisk.error} onRetry={highRisk.refetch} />
            </div>
          )}
          {highRisk.data && highRisk.data.projects.length === 0 && (
            <div className="col-span-full">
              <EmptyState title="Nothing flagged yet" description="No projects currently show medium or high risk signals." />
            </div>
          )}
          {highRisk.data?.projects.map((p, i) => <PriorityCard key={p.projectId} item={p} index={i} />)}
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)] p-5"
    >
      <h3 className="text-sm font-semibold text-[var(--color-ink)]">{title}</h3>
      {subtitle && <p className="mt-0.5 text-xs text-[var(--color-ink-faint)]">{subtitle}</p>}
      <div className="mt-3">{children}</div>
    </motion.div>
  );
}
