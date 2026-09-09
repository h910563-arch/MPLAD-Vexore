import { AlertTriangle, SearchX, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

export function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)] p-5">
      <div className="mb-3 h-3 w-24 rounded bg-[var(--color-ivory-soft)]" />
      <div className="h-7 w-32 rounded bg-[var(--color-ivory-soft)]" />
    </div>
  );
}

export function RowSkeleton() {
  return (
    <div className="animate-pulse border-b border-[var(--color-border-soft)] px-5 py-4">
      <div className="mb-2 h-4 w-1/3 rounded bg-[var(--color-ivory-soft)]" />
      <div className="h-3 w-1/4 rounded bg-[var(--color-ivory-soft)]" />
    </div>
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)]">
      {Array.from({ length: rows }).map((_, i) => (
        <RowSkeleton key={i} />
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="flex h-64 animate-pulse items-end gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)] p-6">
      {[40, 65, 30, 80, 55, 45].map((h, i) => (
        <div key={i} className="flex-1 rounded-t bg-[var(--color-ivory-soft)]" style={{ height: `${h}%` }} />
      ))}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-[var(--color-red-line)] bg-[var(--color-red-soft)] px-6 py-12 text-center"
    >
      <AlertTriangle className="h-6 w-6 text-[var(--color-red)]" strokeWidth={1.75} />
      <div>
        <p className="font-medium text-[var(--color-ink)]">Something went wrong</p>
        <p className="mt-1 max-w-sm text-sm text-[var(--color-ink-soft)]">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[var(--color-red-line)] bg-[var(--color-paper)] px-4 py-2 text-sm font-medium text-[var(--color-red)] transition hover:bg-[var(--color-red-soft)]"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Try again
        </button>
      )}
    </motion.div>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[var(--color-border)] px-6 py-16 text-center"
    >
      <SearchX className="h-6 w-6 text-[var(--color-ink-faint)]" strokeWidth={1.5} />
      <div>
        <p className="font-medium text-[var(--color-ink)]">{title}</p>
        <p className="mt-1 max-w-sm text-sm text-[var(--color-ink-soft)]">{description}</p>
      </div>
    </motion.div>
  );
}
