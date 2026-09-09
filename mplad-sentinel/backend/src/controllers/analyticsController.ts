import { Request, Response } from "express";
import * as projectService from "../services/projectService";

export function getSummary(req: Request, res: Response) {
  res.json(projectService.getAnalyticsSummary());
}
