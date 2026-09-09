import { FiltersResponse } from "../types";

interface Props {
  filtersData: FiltersResponse | null;
  riskLevel: string;
  status: string;
  district: string;
  projectType: string;
  sort: string;
  onChange: (patch: Partial<{ riskLevel: string; status: string; district: string; projectType: string; sort: string }>) => void;
}

function Select({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-full border border-[var(--color-border)] bg-[var(--color-paper)] px-3.5 py-2 text-sm text-[var(--color-ink)] focus:border-[var(--color-indigo-line)] focus:outline-none"
    >
      {children}
    </select>
  );
}

export default function FiltersBar({ filtersData, riskLevel, status, district, projectType, sort, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2.5">
      <Select value={riskLevel} onChange={(v) => onChange({ riskLevel: v })}>
        <option value="">All risk levels</option>
        <option value="HIGH">High risk</option>
        <option value="MEDIUM">Medium risk</option>
        <option value="LOW">Low risk</option>
      </Select>

      <Select value={status} onChange={(v) => onChange({ status: v })}>
        <option value="">All statuses</option>
        {filtersData?.statuses.map((s) => (
          <option key={s} value={s}>
            {s.charAt(0) + s.slice(1).toLowerCase().replace("_", " ")}
          </option>
        ))}
      </Select>

      <Select value={district} onChange={(v) => onChange({ district: v })}>
        <option value="">All districts</option>
        {filtersData?.districts.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </Select>

      <Select value={projectType} onChange={(v) => onChange({ projectType: v })}>
        <option value="">All project types</option>
        {filtersData?.projectTypes.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </Select>

      <Select value={sort} onChange={(v) => onChange({ sort: v })}>
        <option value="highest-risk">Sort: Highest risk</option>
        <option value="lowest-risk">Sort: Lowest risk</option>
        <option value="highest-cost">Sort: Highest cost</option>
        <option value="lowest-progress">Sort: Lowest progress</option>
        <option value="most-delayed">Sort: Most delayed</option>
      </Select>
    </div>
  );
}
