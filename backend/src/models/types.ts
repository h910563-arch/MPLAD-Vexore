export type ProjectStatus = "ONGOING" | "COMPLETED" | "DELAYED" | "NOT_STARTED";
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";
export type AnomalyType = "COST" | "DELAY" | "EXPENDITURE" | "SIMILARITY";
export type Severity = "LOW" | "MEDIUM" | "HIGH";

export interface Project {
  id: number;
  projectId: string;
  projectName: string;
  projectType: string;
  state: string;
  district: string;
  constituency: string;
  cost: number; // in INR lakh
  sanctionDate: string; // ISO date
  expectedCompletionDate: string; // ISO date
  progressPercentage: number; // 0-100
  expenditurePercentage: number; // 0-100
  implementingAgency: string;
  latitude: number;
  longitude: number;
  description: string;
  status: ProjectStatus;
  recommendationDate: string;
  workStartedDate: string | null;
}

export interface AnomalyReason {
  type: AnomalyType;
  severity: Severity;
  message: string;
  score: number; // contribution to total risk score
  data?: Record<string, string | number>;
}

export interface RiskResult {
  projectId: string;
  riskScore: number;
  riskLevel: RiskLevel;
  reasons: AnomalyReason[];
  breakdown: { type: AnomalyType; label: string; score: number }[];
}

export interface SimilarProject {
  projectId: string;
  projectName: string;
  district: string;
  cost: number;
  distanceKm: number;
  similarity: number; // 0-100
}
