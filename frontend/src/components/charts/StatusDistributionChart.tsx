import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { StatusDistributionItem } from "../../types";
import { STATUS_LABELS } from "../../utils/format";
import { ChartTooltip } from "./tooltip";

const COLORS: Record<string, string> = {
  COMPLETED: "#2e7d5b",
  ONGOING: "#3d4a8a",
  DELAYED: "#b9791f",
  NOT_STARTED: "#a3a396",
};

export default function StatusDistributionChart({ data }: { data: StatusDistributionItem[] }) {
  const chartData = data.map((d) => ({ name: STATUS_LABELS[d.status], value: d.count, status: d.status }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="46%"
          innerRadius={52}
          outerRadius={78}
          paddingAngle={2}
          cornerRadius={3}
          startAngle={90}
          endAngle={-270}
          strokeWidth={0}
          isAnimationActive={true}
        >
          {chartData.map((d) => (
            <Cell key={d.status} fill={COLORS[d.status]} />
          ))}
        </Pie>
        <Tooltip content={<ChartTooltip />} />
        <Legend
          verticalAlign="bottom"
          height={32}
          iconType="circle"
          iconSize={8}
          formatter={(value) => <span style={{ color: "#565f75", fontSize: 12 }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
