import { ICompanyDocument } from "../model/company.model";

export interface ICompanyService {
  createCompany(userId: string, data: any): Promise<ICompanyDocument>;
  getCompanyById(id: string, userId: string): Promise<ICompanyDocument>;
  updateCompany(id: string, userId: string, updateData: any): Promise<ICompanyDocument>;
  deleteCompany(id: string, userId: string): Promise<boolean>;
  getCompanies(
    userId: string,
    query: {
      page?: string;
      limit?: string;
      search?: string;
      status?: string;
      priority?: string;
    }
  ): Promise<{
    companies: ICompanyDocument[];
    total: number;
    page: number;
    limit: number;
  }>;
  triggerResearch(id: string, userId: string): Promise<ICompanyDocument>;
  analyzeCompany(userId: string, name: string, websiteUrl?: string, advancedOptions?: any): Promise<any>;
}


