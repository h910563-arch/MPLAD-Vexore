import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { useFetch } from "../hooks/useFetch";
import { api } from "../services/api";
import RiskDistributionChart from "../components/charts/RiskDistributionChart";
import StatusDistributionChart from "../components/charts/StatusDistributionChart";
import { ChartTooltip } from "../components/charts/tooltip";
import { ChartSkeleton, ErrorState } from "../components/States";
import { ANOMALY_LABELS } from "../utils/format";

export default function Analytics() {
  const { data, loading, error, refetch } = useFetch(() => api.getAnalyticsSummary(), []);

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="font-[var(--font-display)] text-[28px] font-semibold text-[var(--color-ink)]">Analytics</h1>
        <p className="mt-1.5 text-sm text-[var(--color-ink-soft)]">
          Aggregate cost, progress and anomaly patterns across all monitored projects.
        </p>
      </motion.div>

      {loading && (
        <div className="mt-7 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      )}

      {error && (
        <div className="mt-7">
          <ErrorState message={error} onRetry={refetch} />
        </div>
      )}

      {data && (
        <div className="mt-7 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <ChartCard title="Risk Distribution">
            <RiskDistributionChart data={data.riskDistribution} />
          </ChartCard>

          <ChartCard title="Project Status Distribution">
            <StatusDistributionChart data={data.statusDistribution} />
          </ChartCard>

          <ChartCard title="Average Project Cost by Type" subtitle="In ₹ lakh">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.avgCostByType} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6E0D2" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#8b93a6" }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="type"
                  tick={{ fontSize: 11, fill: "#565f75" }}
                  axisLine={false}
                  tickLine={false}
                  width={130}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(27,35,51,0.03)" }} />
                <Bar dataKey="avgCost" fill="#3d4a8a" radius={[0, 6, 6, 0]} barSize={16} name="Avg cost (₹L)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Average Progress by District" subtitle="Percent complete">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.avgProgressByDistrict} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6E0D2" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "#8b93a6" }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="district"
                  tick={{ fontSize: 11, fill: "#565f75" }}
                  axisLine={false}
                  tickLine={false}
                  width={90}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(27,35,51,0.03)" }} />
                <Bar dataKey="avgProgress" fill="#2e7d5b" radius={[0, 6, 6, 0]} barSize={16} name="Avg progress %" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Anomalies by Category" subtitle="Number of projects flagging each signal">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={data.anomalyCounts.map((a) => ({ ...a, label: ANOMALY_LABELS[a.type] }))}
                margin={{ left: -12, right: 16, top: 8, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E6E0D2" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#8b93a6" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#8b93a6" }} axisLine={false} tickLine={false} width={28} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(27,35,51,0.03)" }} />
                <Bar dataKey="count" fill="#b9791f" radius={[6, 6, 0, 0]} barSize={36} name="Projects flagged" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}
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
