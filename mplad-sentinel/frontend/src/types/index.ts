export type ProjectStatus = "ONGOING" | "COMPLETED" | "DELAYED" | "NOT_STARTED";
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";
export type AnomalyType = "COST" | "DELAY" | "EXPENDITURE" | "SIMILARITY";
export type Severity = "LOW" | "MEDIUM" | "HIGH";

export interface AnomalyReason {
  type: AnomalyType;
  severity: Severity;
  message: string;
  score: number;
  data?: Record<string, string | number>;
}

export interface RiskResult {
  projectId: string;
  riskScore: number;
  riskLevel: RiskLevel;
  reasons: AnomalyReason[];
  breakdown: { type: AnomalyType; label: string; score: number }[];
}

export interface Project {
  id: number;
  projectId: string;
  projectName: string;
  projectType: string;
  state: string;
  district: string;
  constituency: string;
  cost: number;
  sanctionDate: string;
  expectedCompletionDate: string;
  progressPercentage: number;
  expenditurePercentage: number;
  implementingAgency: string;
  latitude: number;
  longitude: number;
  description: string;
  status: ProjectStatus;
  recommendationDate: string;
  workStartedDate: string | null;
}

export interface ProjectWithRisk extends Project {
  risk: RiskResult;
}

export interface SimilarProject {
  projectId: string;
  projectName: string;
  district: string;
  cost: number;
  distanceKm: number;
  similarity: number;
}

export interface DashboardStats {
  totalProjects: number;
  totalFundsLakh: number;
  completed: number;
  delayed: number;
  highRisk: number;
}

export interface RiskDistributionItem {
  level: RiskLevel;
  count: number;
}

export interface StatusDistributionItem {
  status: ProjectStatus;
  count: number;
}

export interface DistrictDistributionItem {
  district: string;
  count: number;
}

export interface ExpenditureVsProgressItem {
  projectId: string;
  projectName: string;
  progress: number;
  expenditure: number;
}

export interface AnalyticsSummary {
  avgCostByType: { type: string; avgCost: number }[];
  avgProgressByDistrict: { district: string; avgProgress: number }[];
  anomalyCounts: { type: AnomalyType; count: number }[];
  riskDistribution: RiskDistributionItem[];
  statusDistribution: StatusDistributionItem[];
}

export interface FiltersResponse {
  districts: string[];
  projectTypes: string[];
  statuses: string[];
}
