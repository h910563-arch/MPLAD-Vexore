import { ScatterChart, Scatter, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, ReferenceLine, Cell } from "recharts";
import { ExpenditureVsProgressItem } from "../../types";

export default function ExpenditureScatterChart({ data }: { data: ExpenditureVsProgressItem[] }) {
  const points = data.map((d) => ({
    ...d,
    gap: d.expenditure - d.progress,
  }));

  const colorFor = (gap: number) => (gap >= 30 ? "#b33f36" : gap >= 15 ? "#b9791f" : "#3d4a8a");

  return (
    <ResponsiveContainer width="100%" height={280}>
      <ScatterChart margin={{ left: -8, right: 16, top: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E6E0D2" />
        <XAxis
          type="number"
          dataKey="progress"
          name="Progress"
          unit="%"
          domain={[0, 100]}
          tick={{ fontSize: 11, fill: "#8b93a6" }}
          axisLine={false}
          tickLine={false}
          label={{ value: "Progress %", position: "insideBottom", offset: -4, fontSize: 11, fill: "#8b93a6" }}
        />
        <YAxis
          type="number"
          dataKey="expenditure"
          name="Expenditure"
          unit="%"
          domain={[0, 100]}
          tick={{ fontSize: 11, fill: "#8b93a6" }}
          axisLine={false}
          tickLine={false}
          label={{ value: "Expenditure %", angle: -90, position: "insideLeft", fontSize: 11, fill: "#8b93a6" }}
        />
        <ReferenceLine
          segment={[{ x: 0, y: 0 }, { x: 100, y: 100 }]}
          stroke="#c7cced"
          strokeDasharray="4 4"
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload || !payload.length) return null;
            const p = payload[0].payload as ExpenditureVsProgressItem;
            return (
              <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-paper)] px-3 py-2 text-xs shadow-[0_4px_20px_-4px_rgba(27,35,51,0.15)]">
                <p className="mb-1 font-medium text-[var(--color-ink)]">{p.projectName}</p>
                <p className="font-mono text-[var(--color-ink-soft)]">Progress: {p.progress}%</p>
                <p className="font-mono text-[var(--color-ink-soft)]">Expenditure: {p.expenditure}%</p>
              </div>
            );
          }}
          cursor={{ strokeDasharray: "3 3" }}
        />
        <Scatter data={points} fill="#3d4a8a">
          {points.map((p) => (
            <Cell key={p.projectId} fill={colorFor(p.gap)} fillOpacity={0.75} />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
}
