import {
  Project,
  ProjectWithRisk,
  RiskResult,
  SimilarProject,
  DashboardStats,
  RiskDistributionItem,
  StatusDistributionItem,
  DistrictDistributionItem,
  ExpenditureVsProgressItem,
  AnalyticsSummary,
  FiltersResponse,
} from "../types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`);
  } catch {
    throw new ApiError("Could not reach the MPLAD Vexore backend. Make sure the API server is running.");
  }
  if (!res.ok) {
    throw new ApiError(`Request failed (${res.status}) for ${path}`);
  }
  return res.json() as Promise<T>;
}

export interface ProjectListParams {
  [key: string]: string | undefined;
  search?: string;
  riskLevel?: string;
  status?: string;
  district?: string;
  projectType?: string;
  sort?: string;
}

function toQuery(params: Record<string, string | undefined>): string {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v) q.set(k, v);
  });
  const s = q.toString();
  return s ? `?${s}` : "";
}

export const api = {
  getProjects: (params: ProjectListParams = {}) =>
    request<{ total: number; projects: ProjectWithRisk[] }>(`/projects${toQuery(params)}`),
  getProject: (id: string) => request<Project & { risk: RiskResult }>(`/projects/${id}`),
  getHighRiskProjects: (limit = 6) =>
    request<{ projects: ProjectWithRisk[] }>(`/projects/high-risk?limit=${limit}`),
  getProjectRisk: (id: string) => request<RiskResult>(`/projects/${id}/risk`),
  getSimilarProjects: (id: string) => request<{ similar: SimilarProject[] }>(`/projects/${id}/similar`),
  getFilters: () => request<FiltersResponse>("/projects/filters"),
  getDashboardStats: () => request<DashboardStats>("/dashboard/stats"),
  getRiskDistribution: () => request<RiskDistributionItem[]>("/dashboard/risk-distribution"),
  getStatusDistribution: () => request<StatusDistributionItem[]>("/dashboard/status-distribution"),
  getDistrictDistribution: () => request<DistrictDistributionItem[]>("/dashboard/district-distribution"),
  getExpenditureVsProgress: () => request<ExpenditureVsProgressItem[]>("/dashboard/expenditure-vs-progress"),
  getAnalyticsSummary: () => request<AnalyticsSummary>("/analytics/summary"),
};

export { ApiError };
