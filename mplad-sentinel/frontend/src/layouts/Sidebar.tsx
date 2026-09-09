import { NavLink } from "react-router-dom";
import { LayoutGrid, ListChecks, ShieldAlert, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

const NAV = [
  { to: "/dashboard", label: "Overview", icon: LayoutGrid },
  { to: "/projects", label: "Projects", icon: ListChecks },
  { to: "/high-risk", label: "Priority Review", icon: ShieldAlert },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
];

export default function Sidebar({ open, onNavigate }: { open: boolean; onNavigate?: () => void }) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-[var(--color-border)] bg-[var(--color-paper)] transition-transform duration-300 lg:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex h-16 items-center gap-2.5 border-b border-[var(--color-border)] px-6">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--color-ink)]">
          <svg viewBox="0 0 32 32" className="h-4 w-4">
            <path
              d="M8 21 L13 11 L16 17 L19 9 L24 21"
              fill="none"
              stroke="#EDE7D6"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span className="font-[var(--font-display)] text-[15px] font-semibold tracking-tight text-[var(--color-ink)]">
          MPLAD Vexore
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-5">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "text-[var(--color-ink)]"
                  : "text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-lg bg-[var(--color-indigo-soft)]"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <Icon className="relative z-10 h-4 w-4" strokeWidth={1.75} />
                <span className="relative z-10">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-[var(--color-border)] px-6 py-4">
        <p className="text-[11px] font-medium tracking-wide text-[var(--color-ink-faint)]">Prototype • SIH 2026</p>
      </div>
    </aside>
  );
}
