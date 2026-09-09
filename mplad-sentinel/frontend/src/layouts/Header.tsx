import { useState } from "react";
import { Search, Menu, CircleUserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) navigate(`/projects?search=${encodeURIComponent(query.trim())}`);
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-[var(--color-border)] bg-[var(--color-ivory)]/90 px-4 backdrop-blur sm:px-8">
      <button
        onClick={onMenuClick}
        className="rounded-md p-1.5 text-[var(--color-ink-soft)] hover:bg-[var(--color-ivory-soft)] lg:hidden"
        aria-label="Toggle menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="hidden sm:block">
        <p className="text-[11px] font-medium tracking-[0.08em] text-[var(--color-ink-faint)]">
          AI-ASSISTED PROJECT MONITORING
        </p>
      </div>

      <form onSubmit={handleSearch} className="ml-auto flex max-w-xs flex-1 items-center sm:max-w-sm">
        <div className="flex w-full items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-paper)] px-3.5 py-2 focus-within:border-[var(--color-indigo-line)]">
          <Search className="h-4 w-4 shrink-0 text-[var(--color-ink-faint)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, districts, IDs…"
            className="w-full bg-transparent text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus:outline-none"
          />
        </div>
      </form>

      <div className="flex items-center gap-3 border-l border-[var(--color-border)] pl-4">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium leading-tight text-[var(--color-ink)]">Review Officer</p>
          <p className="text-xs leading-tight text-[var(--color-ink-faint)]">Monitoring Cell</p>
        </div>
        <CircleUserRound className="h-8 w-8 text-[var(--color-ink-faint)]" strokeWidth={1.4} />
      </div>
    </header>
  );
}
