import { Request, Response } from "express";
import * as projectService from "../services/projectService";

export function getStats(req: Request, res: Response) {
  res.json(projectService.getDashboardStats());
}

export function getRiskDistribution(req: Request, res: Response) {
  res.json(projectService.getRiskDistribution());
}

export function getStatusDistribution(req: Request, res: Response) {
  res.json(projectService.getStatusDistribution());
}

export function getDistrictDistribution(req: Request, res: Response) {
  res.json(projectService.getDistrictDistribution());
}

export function getExpenditureVsProgress(req: Request, res: Response) {
  res.json(projectService.getExpenditureVsProgress());
}
