import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, CartesianGrid } from "recharts";
import { RiskDistributionItem } from "../../types";
import { ChartTooltip } from "./tooltip";

const COLORS: Record<string, string> = { LOW: "#2e7d5b", MEDIUM: "#b9791f", HIGH: "#b33f36" };
const LABELS: Record<string, string> = { LOW: "Low", MEDIUM: "Medium", HIGH: "High" };

export default function RiskDistributionChart({ data }: { data: RiskDistributionItem[] }) {
  const chartData = data.map((d) => ({ name: LABELS[d.level], count: d.count, level: d.level }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 20, top: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E6E0D2" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11, fill: "#8b93a6" }} axisLine={false} tickLine={false} />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 12, fill: "#565f75" }}
          axisLine={false}
          tickLine={false}
          width={64}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(27,35,51,0.03)" }} />
        <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={28} name="Projects">
          {chartData.map((d) => (
            <Cell key={d.level} fill={COLORS[d.level]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
