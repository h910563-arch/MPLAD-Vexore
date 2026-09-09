import { Project, AnomalyReason, RiskResult, SimilarProject, RiskLevel } from "../models/types";

const TODAY = new Date("2026-09-09");

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function riskLevelFromScore(score: number): RiskLevel {
  if (score >= 70) return "HIGH";
  if (score >= 40) return "MEDIUM";
  return "LOW";
}

// Haversine distance in km between two lat/lng points.
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Simple bag-of-words cosine similarity over project type + description text.
// This is intentionally lightweight and explainable for a prototype, rather
// than a production-grade NLP similarity model.
function textSimilarity(a: string, b: string): number {
  const tokenize = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2);
  const wordsA = tokenize(a);
  const wordsB = tokenize(b);
  const freq = (words: string[]) => {
    const m = new Map<string, number>();
    for (const w of words) m.set(w, (m.get(w) ?? 0) + 1);
    return m;
  };
  const fa = freq(wordsA);
  const fb = freq(wordsB);
  const vocab = new Set([...fa.keys(), ...fb.keys()]);
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (const w of vocab) {
    const va = fa.get(w) ?? 0;
    const vb = fb.get(w) ?? 0;
    dot += va * vb;
    magA += va * va;
    magB += vb * vb;
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

function expectedDurationDays(p: Project): number {
  return Math.max(
    1,
    Math.round((new Date(p.expectedCompletionDate).getTime() - new Date(p.sanctionDate).getTime()) / 86400000)
  );
}

function daysElapsed(p: Project): number {
  return Math.round((TODAY.getTime() - new Date(p.sanctionDate).getTime()) / 86400000);
}

function monthsBehindSchedule(p: Project): number {
  if (p.status === "COMPLETED") return 0;
  const daysOverdue = daysElapsed(p) - expectedDurationDays(p);
  if (daysOverdue <= 0) return 0;
  return Math.round((daysOverdue / 30) * 10) / 10;
}

/**
 * Cost anomaly: compare a project's cost against the median cost of
 * "comparable" projects — same project type across the dataset (a simple,
 * explainable prototype baseline; a production system could narrow this to
 * type + district + agency).
 */
function assessCost(project: Project, comparableCosts: number[]): AnomalyReason | null {
  const baseline = median(comparableCosts.filter((c) => c > 0));
  if (baseline <= 0) return null;
  const deviation = (project.cost - baseline) / baseline;
  if (deviation < 0.35) return null;

  const pct = Math.round(deviation * 100);
  let severity: AnomalyReason["severity"] = "LOW";
  let score = 8;
  if (deviation >= 0.6) {
    severity = "HIGH";
    score = 30;
  } else if (deviation >= 0.45) {
    severity = "MEDIUM";
    score = 20;
  } else {
    severity = "LOW";
    score = 10;
  }

  return {
    type: "COST",
    severity,
    message: `Project cost is ${pct}% higher than comparable ${project.projectType.toLowerCase()} projects.`,
    score,
    data: {
      projectCost: `₹${project.cost}L`,
      comparableMedian: `₹${round1(baseline)}L`,
      deviation: `${pct}%`,
    },
  };
}

function assessDelay(project: Project): AnomalyReason | null {
  const months = monthsBehindSchedule(project);
  if (months < 2) return null;

  let severity: AnomalyReason["severity"] = "LOW";
  let score = 8;
  if (months >= 10) {
    severity = "HIGH";
    score = 25;
  } else if (months >= 5) {
    severity = "MEDIUM";
    score = 16;
  } else {
    severity = "LOW";
    score = 8;
  }

  return {
    type: "DELAY",
    severity,
    message: `Project is approximately ${months} months behind the expected schedule.`,
    score,
    data: {
      expectedCompletion: project.expectedCompletionDate,
      monthsBehind: months,
      progress: `${project.progressPercentage}%`,
    },
  };
}

function assessExpenditure(project: Project): AnomalyReason | null {
  const gap = project.expenditurePercentage - project.progressPercentage;
  if (gap < 20) return null;

  let severity: AnomalyReason["severity"] = "LOW";
  let score = 10;
  if (gap >= 45) {
    severity = "HIGH";
    score = 25;
  } else if (gap >= 30) {
    severity = "MEDIUM";
    score = 17;
  } else {
    severity = "LOW";
    score = 10;
  }

  return {
    type: "EXPENDITURE",
    severity,
    message: `${project.expenditurePercentage}% of funds have been spent while reported progress is only ${project.progressPercentage}%.`,
    score,
    data: {
      expenditure: `${project.expenditurePercentage}%`,
      progress: `${project.progressPercentage}%`,
      gap: `${gap}pp`,
    },
  };
}

function findSimilarProjects(project: Project, allProjects: Project[]): SimilarProject[] {
  const RADIUS_KM = 5;
  const results: SimilarProject[] = [];
  for (const other of allProjects) {
    if (other.id === project.id) continue;
    if (other.projectType !== project.projectType) continue;
    const distanceKm = haversineKm(project.latitude, project.longitude, other.latitude, other.longitude);
    if (distanceKm > RADIUS_KM) continue;
    const textSim = textSimilarity(
      `${project.projectType} ${project.description}`,
      `${other.projectType} ${other.description}`
    );
    const proximityScore = Math.max(0, 1 - distanceKm / RADIUS_KM);
    const similarity = Math.round((textSim * 0.6 + proximityScore * 0.4) * 100);
    if (similarity < 55) continue;
    results.push({
      projectId: other.projectId,
      projectName: other.projectName,
      district: other.district,
      cost: other.cost,
      distanceKm: Math.round(distanceKm * 10) / 10,
      similarity,
    });
  }
  return results.sort((a, b) => b.similarity - a.similarity).slice(0, 5);
}

function assessSimilarity(similar: SimilarProject[]): AnomalyReason | null {
  if (similar.length === 0) return null;
  const top = similar[0];
  let severity: AnomalyReason["severity"] = "LOW";
  let score = 10;
  if (top.similarity >= 80) {
    severity = "HIGH";
    score = 20;
  } else if (top.similarity >= 68) {
    severity = "MEDIUM";
    score = 14;
  } else {
    severity = "LOW";
    score = 8;
  }
  return {
    type: "SIMILARITY",
    severity,
    message: `A potentially similar project was detected ${top.distanceKm} km away.`,
    score,
    data: {
      nearestProject: top.projectName,
      distance: `${top.distanceKm} km`,
      similarity: `${top.similarity}%`,
    },
  };
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

export function computeRisk(project: Project, allProjects: Project[]): RiskResult {
  const comparableCosts = allProjects.filter((p) => p.projectType === project.projectType).map((p) => p.cost);

  const similar = findSimilarProjects(project, allProjects);

  const reasons: AnomalyReason[] = [
    assessCost(project, comparableCosts),
    assessDelay(project),
    assessExpenditure(project),
    assessSimilarity(similar),
  ].filter((r): r is AnomalyReason => r !== null);

  const riskScore = Math.min(100, reasons.reduce((sum, r) => sum + r.score, 0));
  const riskLevel = riskLevelFromScore(riskScore);

  const breakdown = reasons.map((r) => ({
    type: r.type,
    label: labelFor(r.type),
    score: r.score,
  }));

  return { projectId: project.projectId, riskScore, riskLevel, reasons, breakdown };
}

export function getSimilarProjects(project: Project, allProjects: Project[]): SimilarProject[] {
  return findSimilarProjects(project, allProjects);
}

function labelFor(type: AnomalyReason["type"]): string {
  switch (type) {
    case "COST":
      return "Cost anomaly";
    case "DELAY":
      return "Delay anomaly";
    case "EXPENDITURE":
      return "Expenditure mismatch";
    case "SIMILARITY":
      return "Similarity";
  }
}
