import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useFetch } from "../hooks/useFetch";
import { api } from "../services/api";
import FiltersBar from "../components/FiltersBar";
import ProjectTable from "../components/ProjectTable";
import { TableSkeleton, ErrorState, EmptyState } from "../components/States";

export default function Projects() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [riskLevel, setRiskLevel] = useState("");
  const [status, setStatus] = useState("");
  const [district, setDistrict] = useState("");
  const [projectType, setProjectType] = useState("");
  const [sort, setSort] = useState("highest-risk");

  const filtersMeta = useFetch(() => api.getFilters(), []);

  const params = useMemo(
    () => ({ search, riskLevel, status, district, projectType, sort }),
    [search, riskLevel, status, district, projectType, sort]
  );
  const { data, loading, error, refetch } = useFetch(() => api.getProjects(params), [
    search,
    riskLevel,
    status,
    district,
    projectType,
    sort,
  ]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSearchParams(search ? { search } : {});
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="font-[var(--font-display)] text-[28px] font-semibold text-[var(--color-ink)]">All Projects</h1>
        <p className="mt-1.5 text-sm text-[var(--color-ink-soft)]">
          Search, filter and prioritize MPLADS development projects.
        </p>
      </motion.div>

      <div className="mt-6 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex max-w-md items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-paper)] px-4 py-2.5 focus-within:border-[var(--color-indigo-line)]">
          <Search className="h-4 w-4 shrink-0 text-[var(--color-ink-faint)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by project name, district or ID…"
            className="w-full bg-transparent text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus:outline-none"
          />
        </form>

        <FiltersBar
          filtersData={filtersMeta.data}
          riskLevel={riskLevel}
          status={status}
          district={district}
          projectType={projectType}
          sort={sort}
          onChange={(patch) => {
            if (patch.riskLevel !== undefined) setRiskLevel(patch.riskLevel);
            if (patch.status !== undefined) setStatus(patch.status);
            if (patch.district !== undefined) setDistrict(patch.district);
            if (patch.projectType !== undefined) setProjectType(patch.projectType);
            if (patch.sort !== undefined) setSort(patch.sort);
          }}
        />
      </div>

      <div className="mt-6">
        {loading && <TableSkeleton rows={8} />}
        {error && <ErrorState message={error} onRetry={refetch} />}
        {data && data.projects.length === 0 && (
          <EmptyState
            title="No projects match your filters"
            description="Try clearing a filter or searching with a different term."
          />
        )}
        {data && data.projects.length > 0 && (
          <>
            <p className="mb-3 text-xs text-[var(--color-ink-faint)]">{data.total} projects found</p>
            <ProjectTable projects={data.projects} />
          </>
        )}
      </div>
    </div>
  );
}
