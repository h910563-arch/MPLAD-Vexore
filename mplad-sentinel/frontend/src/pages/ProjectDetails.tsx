import { motion } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Building2 } from "lucide-react";
import { useFetch } from "../hooks/useFetch";
import { api } from "../services/api";
import RiskGauge from "../components/RiskGauge";
import RiskBadge from "../components/RiskBadge";
import StatusBadge from "../components/StatusBadge";
import ProgressBar from "../components/ProgressBar";
import AnomalyCard from "../components/AnomalyCard";
import ProjectTimeline from "../components/ProjectTimeline";
import SimilarProjectCard from "../components/SimilarProjectCard";
import { ErrorState, EmptyState } from "../components/States";
import { formatDate, formatLakh } from "../utils/format";

export default function ProjectDetails() {
  const { id = "" } = useParams();
  const projectQuery = useFetch(() => api.getProject(id), [id]);
  const similarQuery = useFetch(() => api.getSimilarProjects(id), [id]);

  if (projectQuery.loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-4 w-24 rounded bg-[var(--color-ivory-soft)]" />
        <div className="h-9 w-72 rounded bg-[var(--color-ivory-soft)]" />
        <div className="h-64 rounded-2xl bg-[var(--color-ivory-soft)]" />
      </div>
    );
  }

  if (projectQuery.error) {
    return <ErrorState message={projectQuery.error} onRetry={projectQuery.refetch} />;
  }

  const project = projectQuery.data;
  if (!project) return null;

  const risk = project.risk;
  const expectedProgress = expectedProgressPercent(project.sanctionDate, project.expectedCompletionDate);

  return (
    <div>
      <Link
        to="/projects"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Projects
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mt-4 flex flex-col justify-between gap-6 sm:flex-row sm:items-start"
      >
        <div>
          <h1 className="font-[var(--font-display)] text-3xl font-semibold text-[var(--color-ink)]">
            {project.projectName}
          </h1>
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--color-ink-soft)]">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {project.district}, {project.state}
            </span>
            <span className="font-mono text-xs text-[var(--color-ink-faint)]">{project.projectId}</span>
          </p>
          <div className="mt-3 flex items-center gap-2">
            <StatusBadge status={project.status} />
            <RiskBadge level={risk.riskLevel} />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col items-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)] p-5"
        >
          <RiskGauge score={risk.riskScore} level={risk.riskLevel} />
          <p className="mt-1 text-xs font-medium text-[var(--color-ink-faint)]">Prototype Risk Score</p>
        </motion.div>
      </motion.div>

      {/* Progress vs expenditure */}
      <Section title="Project Progress">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <ProgressBar value={project.progressPercentage} label="Progress" tone="indigo" />
          <ProgressBar value={project.expenditurePercentage} label="Expenditure" tone="amber" />
          <ProgressBar value={Math.round(expectedProgress)} label="Expected progress" tone="green" />
        </div>
        {project.expenditurePercentage - project.progressPercentage >= 20 && (
          <p className="mt-4 text-xs text-[var(--color-ink-faint)]">
            Expenditure is running well ahead of physical progress, which is one of the signals behind this project's risk score.
          </p>
        )}
      </Section>

      {/* Risk analysis */}
      <Section title="Why was this project flagged?">
        {risk.reasons.length === 0 ? (
          <EmptyState title="No anomalies detected" description="This project currently matches expected cost, schedule and spending patterns." />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {risk.reasons.map((r, i) => (
              <AnomalyCard key={r.type} reason={r} index={i} />
            ))}
          </div>
        )}
      </Section>

      {/* Risk score breakdown */}
      {risk.breakdown.length > 0 && (
        <Section title="Risk Score Breakdown" subtitle="Illustrative anomaly weighting — not an official government scoring rule.">
          <div className="space-y-3">
            {risk.breakdown.map((b) => (
              <div key={b.type} className="flex items-center gap-4">
                <span className="w-40 shrink-0 text-sm text-[var(--color-ink-soft)]">{b.label}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--color-ivory-soft)]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(b.score / 30) * 100}%` }}
                    transition={{ duration: 0.7 }}
                    className="h-full rounded-full bg-[var(--color-indigo)]"
                  />
                </div>
                <span className="w-8 shrink-0 text-right font-mono text-sm text-[var(--color-ink)]">{b.score}</span>
              </div>
            ))}
            <div className="flex items-center gap-4 border-t border-[var(--color-border)] pt-3">
              <span className="w-40 shrink-0 text-sm font-semibold text-[var(--color-ink)]">Total Risk Score</span>
              <div className="flex-1" />
              <span className="w-8 shrink-0 text-right font-mono text-sm font-semibold text-[var(--color-ink)]">
                {risk.riskScore}
              </span>
            </div>
          </div>
        </Section>
      )}

      {/* Timeline */}
      <Section title="Project Timeline">
        <ProjectTimeline project={project} />
      </Section>

      {/* Project information */}
      <Section title="Project Information">
        <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
          <InfoRow label="Project Type" value={project.projectType} />
          <InfoRow label="Implementing Agency" value={project.implementingAgency} icon={Building2} />
          <InfoRow label="District" value={project.district} />
          <InfoRow label="State" value={project.state} />
          <InfoRow label="Constituency" value={project.constituency} />
          <InfoRow label="Project Cost" value={formatLakh(project.cost)} mono />
          <InfoRow label="Sanction Date" value={formatDate(project.sanctionDate)} />
          <InfoRow label="Expected Completion" value={formatDate(project.expectedCompletionDate)} />
          <InfoRow label="Current Status" value={<StatusBadge status={project.status} />} />
          <InfoRow label="Current Progress" value={`${project.progressPercentage}%`} mono />
        </div>
        <p className="mt-5 border-t border-[var(--color-border)] pt-4 text-sm leading-relaxed text-[var(--color-ink-soft)]">
          {project.description}
        </p>
      </Section>

      {/* Similar projects */}
      <Section title="Potentially Similar Projects" subtitle="Potential similarity — requires human verification.">
        {similarQuery.loading && <p className="text-sm text-[var(--color-ink-faint)]">Checking nearby projects…</p>}
        {similarQuery.error && <ErrorState message={similarQuery.error} onRetry={similarQuery.refetch} />}
        {similarQuery.data && similarQuery.data.similar.length === 0 && (
          <EmptyState title="No similar projects detected" description="No nearby projects of the same type met the similarity threshold." />
        )}
        {similarQuery.data && similarQuery.data.similar.length > 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {similarQuery.data.similar.map((s, i) => (
              <SimilarProjectCard key={s.projectId} item={s} index={i} />
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4 }}
      className="mt-9"
    >
      <h2 className="font-[var(--font-display)] text-xl font-semibold text-[var(--color-ink)]">{title}</h2>
      {subtitle && <p className="mt-1 text-xs text-[var(--color-ink-faint)]">{subtitle}</p>}
      <div className="mt-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)] p-5 sm:p-6">
        {children}
      </div>
    </motion.section>
  );
}

function InfoRow({
  label,
  value,
  mono,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-center justify-between border-b border-[var(--color-border-soft)] pb-3">
      <span className="flex items-center gap-1.5 text-sm text-[var(--color-ink-faint)]">
        {Icon && <Icon className="h-3.5 w-3.5" />} {label}
      </span>
      <span className={`text-sm text-[var(--color-ink)] ${mono ? "font-mono" : "font-medium"}`}>{value}</span>
    </div>
  );
}

function expectedProgressPercent(sanctionDate: string, expectedCompletionDate: string): number {
  const today = new Date("2026-09-09");
  const start = new Date(sanctionDate);
  const end = new Date(expectedCompletionDate);
  const total = end.getTime() - start.getTime();
  if (total <= 0) return 100;
  const elapsed = today.getTime() - start.getTime();
  return Math.min(100, Math.max(0, (elapsed / total) * 100));
}
