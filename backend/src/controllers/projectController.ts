import { Request, Response } from "express";
import * as projectService from "../services/projectService";

export function listProjects(req: Request, res: Response) {
  const { search, riskLevel, status, district, projectType, sort } = req.query as Record<string, string | undefined>;

  let items = projectService.getProjectsWithRisk();

  if (search) {
    const q = search.toLowerCase();
    items = items.filter(
      (i) =>
        i.project.projectName.toLowerCase().includes(q) ||
        i.project.district.toLowerCase().includes(q) ||
        i.project.projectId.toLowerCase().includes(q)
    );
  }
  if (riskLevel) items = items.filter((i) => i.risk.riskLevel === riskLevel);
  if (status) items = items.filter((i) => i.project.status === status);
  if (district) items = items.filter((i) => i.project.district === district);
  if (projectType) items = items.filter((i) => i.project.projectType === projectType);

  switch (sort) {
    case "highest-risk":
      items.sort((a, b) => b.risk.riskScore - a.risk.riskScore);
      break;
    case "lowest-risk":
      items.sort((a, b) => a.risk.riskScore - b.risk.riskScore);
      break;
    case "highest-cost":
      items.sort((a, b) => b.project.cost - a.project.cost);
      break;
    case "lowest-progress":
      items.sort((a, b) => a.project.progressPercentage - b.project.progressPercentage);
      break;
    case "most-delayed":
      items.sort((a, b) => {
        const da = a.risk.reasons.find((r) => r.type === "DELAY")?.score ?? 0;
        const db_ = b.risk.reasons.find((r) => r.type === "DELAY")?.score ?? 0;
        return db_ - da;
      });
      break;
    default:
      items.sort((a, b) => b.risk.riskScore - a.risk.riskScore);
  }

  res.json({
    total: items.length,
    projects: items.map((i) => ({ ...i.project, risk: i.risk })),
  });
}

export function getProject(req: Request, res: Response) {
  const project = projectService.getProjectById(req.params.id);
  if (!project) return res.status(404).json({ error: "Project not found" });
  const risk = projectService.getRiskForProject(req.params.id);
  res.json({ ...project, risk });
}

export function getHighRisk(req: Request, res: Response) {
  const limit = req.query.limit ? Number(req.query.limit) : 8;
  const items = projectService.getHighRiskProjects(limit);
  res.json({
    projects: items.map((i) => ({ ...i.project, risk: i.risk })),
  });
}

export function getProjectRisk(req: Request, res: Response) {
  const risk = projectService.getRiskForProject(req.params.id);
  if (!risk) return res.status(404).json({ error: "Project not found" });
  res.json(risk);
}

export function getProjectSimilar(req: Request, res: Response) {
  const similar = projectService.getSimilarForProject(req.params.id);
  if (similar === null) return res.status(404).json({ error: "Project not found" });
  res.json({ similar });
}

export function getFilters(req: Request, res: Response) {
  const all = projectService.getAllProjects();
  const districts = Array.from(new Set(all.map((p) => p.district))).sort();
  const projectTypes = Array.from(new Set(all.map((p) => p.projectType))).sort();
  const statuses = Array.from(new Set(all.map((p) => p.status))).sort();
  res.json({ districts, projectTypes, statuses });
}
