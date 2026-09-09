import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { DistrictDistributionItem } from "../../types";
import { ChartTooltip } from "./tooltip";

export default function DistrictBarChart({ data }: { data: DistrictDistributionItem[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ left: -12, right: 12, top: 8, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E6E0D2" vertical={false} />
        <XAxis
          dataKey="district"
          tick={{ fontSize: 11, fill: "#8b93a6" }}
          axisLine={false}
          tickLine={false}
          interval={0}
          angle={-25}
          textAnchor="end"
          height={50}
        />
        <YAxis tick={{ fontSize: 11, fill: "#8b93a6" }} axisLine={false} tickLine={false} width={28} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(27,35,51,0.03)" }} />
        <Bar dataKey="count" fill="#3d4a8a" radius={[6, 6, 0, 0]} barSize={24} name="Projects" />
      </BarChart>
    </ResponsiveContainer>
  );
}
