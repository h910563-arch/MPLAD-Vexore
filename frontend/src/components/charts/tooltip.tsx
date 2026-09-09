interface TooltipPayloadItem {
  color?: string;
  name?: string | number;
  value?: string | number;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string | number;
}

export function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-paper)] px-3 py-2 text-xs shadow-[0_4px_20px_-4px_rgba(27,35,51,0.15)]">
      {label !== undefined && <p className="mb-1 font-medium text-[var(--color-ink)]">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-mono">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}
