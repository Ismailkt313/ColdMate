export type CompanyStatus =
  | "NOT_RESEARCHED"
  | "RESEARCHING"
  | "READY_TO_APPLY"
  | "APPLIED"
  | "INTERVIEW"
  | "ASSESSMENT"
  | "OFFER"
  | "REJECTED"
  | "GHOSTED"
  | "ARCHIVED";

export type CompanyPriority = "LOW" | "MEDIUM" | "HIGH";

export type ResearchStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

export interface ICompanyDetails {
  name: string;
  website: string;
  industry?: string;
  companySize?: string;
  headquarters?: string;
  country?: string;
  foundedYear?: string;
  careersPage?: string;
  linkedin?: string;
  glassdoor?: string;
  github?: string;
  techStack?: string[];
  description?: string;
}

export interface IAIResearch {
  companySummary?: string;
  industry?: string;
  companySize?: string;
  website?: string;
  careersPage?: string;
  linkedin?: string;
  glassdoor?: string;
  github?: string;
  techStack?: string[];
  headquarters?: string;
  country?: string;
  foundedYear?: string;
  recentNews?: string[];
  hiringStatus?: string;
  confidence?: number;
}

export interface ICompany {
  _id: string;
  userId: string;
  status: CompanyStatus;
  priority: CompanyPriority;
  notes: string;
  applicationDate?: string;
  manualData: ICompanyDetails;
  aiResearch?: IAIResearch;
  researchStatus: ResearchStatus;
  researchedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICompaniesResponse {
  companies: ICompany[];
  total: number;
  page: number;
  limit: number;
}
