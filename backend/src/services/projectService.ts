import { db } from "../db/connection";
import { Project } from "../models/types";
import { computeRisk, getSimilarProjects } from "./riskEngine";

export function getAllProjects(): Project[] {
  return db.prepare("SELECT * FROM projects ORDER BY id ASC").all() as Project[];
}

export function getProjectById(projectId: string): Project | undefined {
  return db.prepare("SELECT * FROM projects WHERE projectId = ?").get(projectId) as Project | undefined;
}

export function getProjectsWithRisk() {
  const all = getAllProjects();
  return all.map((p) => ({ project: p, risk: computeRisk(p, all) }));
}

export function getHighRiskProjects(limit = 8) {
  return getProjectsWithRisk()
    .filter((r) => r.risk.riskLevel === "HIGH" || r.risk.riskLevel === "MEDIUM")
    .sort((a, b) => b.risk.riskScore - a.risk.riskScore)
    .slice(0, limit);
}

export function getDashboardStats() {
  const all = getAllProjects();
  const withRisk = getProjectsWithRisk();

  const totalProjects = all.length;
  const totalFundsLakh = all.reduce((sum, p) => sum + p.cost, 0);
  const completed = all.filter((p) => p.status === "COMPLETED").length;
  const delayed = all.filter((p) => p.status === "DELAYED").length;
  const highRisk = withRisk.filter((r) => r.risk.riskLevel === "HIGH").length;

  return {
    totalProjects,
    totalFundsLakh: Math.round(totalFundsLakh * 10) / 10,
    completed,
    delayed,
    highRisk,
  };
}

export function getRiskDistribution() {
  const withRisk = getProjectsWithRisk();
  const low = withRisk.filter((r) => r.risk.riskLevel === "LOW").length;
  const medium = withRisk.filter((r) => r.risk.riskLevel === "MEDIUM").length;
  const high = withRisk.filter((r) => r.risk.riskLevel === "HIGH").length;
  return [
    { level: "LOW", count: low },
    { level: "MEDIUM", count: medium },
    { level: "HIGH", count: high },
  ];
}

export function getStatusDistribution() {
  const all = getAllProjects();
  const counts: Record<string, number> = {};
  for (const p of all) counts[p.status] = (counts[p.status] ?? 0) + 1;
  return Object.entries(counts).map(([status, count]) => ({ status, count }));
}

export function getDistrictDistribution() {
  const all = getAllProjects();
  const counts: Record<string, number> = {};
  for (const p of all) counts[p.district] = (counts[p.district] ?? 0) + 1;
  return Object.entries(counts)
    .map(([district, count]) => ({ district, count }))
    .sort((a, b) => b.count - a.count);
}

export function getExpenditureVsProgress() {
  const all = getAllProjects();
  return all.map((p) => ({
    projectId: p.projectId,
    projectName: p.projectName,
    progress: p.progressPercentage,
    expenditure: p.expenditurePercentage,
  }));
}

export function getRiskForProject(projectId: string) {
  const all = getAllProjects();
  const project = all.find((p) => p.projectId === projectId);
  if (!project) return null;
  return computeRisk(project, all);
}

export function getSimilarForProject(projectId: string) {
  const all = getAllProjects();
  const project = all.find((p) => p.projectId === projectId);
  if (!project) return null;
  return getSimilarProjects(project, all);
}

export function getAnalyticsSummary() {
  const all = getAllProjects();
  const byType: Record<string, { totalCost: number; count: number }> = {};
  for (const p of all) {
    if (!byType[p.projectType]) byType[p.projectType] = { totalCost: 0, count: 0 };
    byType[p.projectType].totalCost += p.cost;
    byType[p.projectType].count += 1;
  }
  const avgCostByType = Object.entries(byType).map(([type, v]) => ({
    type,
    avgCost: Math.round((v.totalCost / v.count) * 10) / 10,
  }));

  const byDistrict: Record<string, { totalProgress: number; count: number }> = {};
  for (const p of all) {
    if (!byDistrict[p.district]) byDistrict[p.district] = { totalProgress: 0, count: 0 };
    byDistrict[p.district].totalProgress += p.progressPercentage;
    byDistrict[p.district].count += 1;
  }
  const avgProgressByDistrict = Object.entries(byDistrict).map(([district, v]) => ({
    district,
    avgProgress: Math.round((v.totalProgress / v.count) * 10) / 10,
  }));

  const withRisk = getProjectsWithRisk();
  const anomalyCounts: Record<string, number> = { COST: 0, DELAY: 0, EXPENDITURE: 0, SIMILARITY: 0 };
  for (const r of withRisk) {
    for (const reason of r.risk.reasons) {
      anomalyCounts[reason.type] = (anomalyCounts[reason.type] ?? 0) + 1;
    }
  }

  return {
    avgCostByType,
    avgProgressByDistrict,
    anomalyCounts: Object.entries(anomalyCounts).map(([type, count]) => ({ type, count })),
    riskDistribution: getRiskDistribution(),
    statusDistribution: getStatusDistribution(),
  };
}
