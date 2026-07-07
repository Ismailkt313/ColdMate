import api from "../lib/axios";
import { ICompany, ICompaniesResponse } from "../types/company";
import { StandardResponse } from "../types/auth";

export class CompanyService {
  static async getCompanies(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    priority?: string;
  }): Promise<StandardResponse<ICompaniesResponse>> {
    const res = await api.get<StandardResponse<ICompaniesResponse>>("/company", { params });
    return res.data;
  }

  static async getCompany(id: string): Promise<StandardResponse<ICompany>> {
    const res = await api.get<StandardResponse<ICompany>>(`/company/${id}`);
    return res.data;
  }

  static async createCompany(data: {
    name: string;
    website?: string;
    notes?: string;
    status?: string;
    priority?: string;
    applicationDate?: string;
  }): Promise<StandardResponse<ICompany>> {
    const res = await api.post<StandardResponse<ICompany>>("/company", data);
    return res.data;
  }

  static async updateCompany(
    id: string,
    data: Partial<{
      name: string;
      website: string;
      industry: string;
      companySize: string;
      headquarters: string;
      country: string;
      foundedYear: string;
      careersPage: string;
      linkedin: string;
      glassdoor: string;
      github: string;
      techStack: string[];
      description: string;
      notes: string;
      status: string;
      priority: string;
      applicationDate: string | null;
    }>
  ): Promise<StandardResponse<ICompany>> {
    const res = await api.patch<StandardResponse<ICompany>>(`/company/${id}`, data);
    return res.data;
  }

  static async deleteCompany(id: string): Promise<StandardResponse<any>> {
    const res = await api.delete<StandardResponse<any>>(`/company/${id}`);
    return res.data;
  }

  static async triggerResearch(id: string): Promise<StandardResponse<ICompany>> {
    const res = await api.post<StandardResponse<ICompany>>(`/company/${id}/research`);
    return res.data;
  }

  static async analyzeCompany(data: {
    name: string;
    website?: string;
    advancedOptions?: {
      targetRole?: string;
      jobUrl?: string;
      focus?: string;
      technologies?: string[] | string;
      instructions?: string;
    };
  }): Promise<StandardResponse<any>> {
    const res = await api.post<StandardResponse<any>>("/company/analyze", data);
    return res.data;
  }
}

