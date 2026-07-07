import { ICompanyService } from "../interface/company.service.interface";
import { ICompanyRepository } from "../interface/company.repository.interface";
import { ICompanyDocument } from "../model/company.model";
import { CompanyIntelligenceService } from "./company-intelligence.service";
import { NotFoundError, BadRequestError } from "../../../errors";

export class CompanyService implements ICompanyService {
  constructor(private companyRepository: ICompanyRepository) {}

  async createCompany(userId: string, data: any): Promise<ICompanyDocument> {
    const { name, website, notes, status, priority, applicationDate, aiResearch, researchStatus, ...restManualData } = data;

    // Validate duplicate company names case-insensitively for the same user
    const duplicateCount = await this.companyRepository.count(userId, {
      "manualData.name": { $regex: new RegExp(`^${name.trim()}$`, "i") },
    });
    if (duplicateCount > 0) {
      throw new BadRequestError(`A company named "${name}" already exists in your tracking list.`);
    }

    // Build initial manualData structure

    const manualData = {
      name,
      website: website || "",
      ...restManualData,
    };

    const isPreResearched = researchStatus === "COMPLETED" && aiResearch;

    const initialCompany: any = {
      status: status || (isPreResearched ? "READY_TO_APPLY" : "NOT_RESEARCHED"),
      priority: priority || "MEDIUM",
      notes: notes || "",
      applicationDate: applicationDate ? new Date(applicationDate) : undefined,
      manualData,
      researchStatus: researchStatus || "PENDING",
    };

    if (isPreResearched) {
      initialCompany.aiResearch = aiResearch;
      initialCompany.researchedAt = new Date();
    }

    const company = await this.companyRepository.create(userId, initialCompany);

    // Automatically trigger research in background if not pre-researched
    if (!isPreResearched) {
      this.triggerResearch(company._id.toString(), userId).catch((err) => {
        console.error("Automatic initial research error:", err);
      });
    }

    return company;
  }


  async getCompanyById(id: string, userId: string): Promise<ICompanyDocument> {
    const company = await this.companyRepository.findById(id, userId);
    if (!company) {
      throw new NotFoundError("Company not found or unauthorized");
    }
    return company;
  }

  async updateCompany(id: string, userId: string, updateData: any): Promise<ICompanyDocument> {
    const company = await this.companyRepository.findById(id, userId);
    if (!company) {
      throw new NotFoundError("Company not found or unauthorized");
    }

    // Split top-level properties and nested manualData updates
    const { status, priority, notes, applicationDate, name: newName, ...manualUpdates } = updateData;

    if (newName !== undefined) {
      if (newName.trim().toLowerCase() !== company.manualData.name.toLowerCase()) {
        const duplicateCount = await this.companyRepository.count(userId, {
          _id: { $ne: id },
          "manualData.name": { $regex: new RegExp(`^${newName.trim()}$`, "i") },
        });
        if (duplicateCount > 0) {
          throw new BadRequestError(`A company named "${newName}" already exists in your tracking list.`);
        }
      }
      manualUpdates.name = newName;
    }


    const queryUpdates: any = {};

    if (status !== undefined) queryUpdates.status = status;
    if (priority !== undefined) queryUpdates.priority = priority;
    if (notes !== undefined) queryUpdates.notes = notes;
    
    if (applicationDate !== undefined) {
      queryUpdates.applicationDate = applicationDate ? new Date(applicationDate) : null;
    }

    // Update manualData fields
    Object.keys(manualUpdates).forEach((key) => {
      queryUpdates[`manualData.${key}`] = manualUpdates[key];
    });

    const updated = await this.companyRepository.update(id, userId, queryUpdates);
    if (!updated) {
      throw new BadRequestError("Failed to update company");
    }
    return updated;
  }

  async deleteCompany(id: string, userId: string): Promise<boolean> {
    const company = await this.companyRepository.findById(id, userId);
    if (!company) {
      throw new NotFoundError("Company not found or unauthorized");
    }
    return this.companyRepository.delete(id, userId);
  }

  async getCompanies(
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
  }> {
    const page = parseInt(query.page || "1", 10);
    const limit = parseInt(query.limit || "10", 10);

    const filter: any = {};

    if (query.status) {
      filter.status = query.status;
    }

    if (query.priority) {
      filter.priority = query.priority;
    }

    if (query.search) {
      filter.$or = [
        { "manualData.name": { $regex: query.search, $options: "i" } },
        { "manualData.industry": { $regex: query.search, $options: "i" } },
        { "manualData.techStack": { $regex: query.search, $options: "i" } },
      ];
    }

    const [companies, total] = await Promise.all([
      this.companyRepository.findWithPagination(userId, filter, page, limit),
      this.companyRepository.count(userId, filter),
    ]);

    return {
      companies,
      total,
      page,
      limit,
    };
  }

  async triggerResearch(id: string, userId: string): Promise<ICompanyDocument> {
    const company = await this.companyRepository.findById(id, userId);
    if (!company) {
      throw new NotFoundError("Company not found or unauthorized");
    }

    // Set research status to PROCESSING and general status to RESEARCHING if it was NOT_RESEARCHED
    const queryUpdates = {
      researchStatus: "PROCESSING",
      status: company.status === "NOT_RESEARCHED" ? "RESEARCHING" : company.status,
    };

    const processingCompany = await this.companyRepository.update(id, userId, queryUpdates);
    if (!processingCompany) {
      throw new BadRequestError("Failed to start research");
    }

    // Run AI analysis in the background
    CompanyIntelligenceService.researchCompany(
      processingCompany.manualData.name,
      processingCompany.manualData.website
    )
      .then(async (aiResearchData) => {
        const updateData: any = {
          aiResearch: aiResearchData,
          researchStatus: "COMPLETED",
          researchedAt: new Date(),
        };

        // If status is still RESEARCHING, advance to READY_TO_APPLY
        const currentCompany = await this.companyRepository.findById(id, userId);
        if (currentCompany && currentCompany.status === "RESEARCHING") {
          updateData.status = "READY_TO_APPLY";
        }
        await this.companyRepository.update(id, userId, updateData);
      })
      .catch(async (err) => {
        console.error(`AI background research failed for company ${id}:`, err);
        await this.companyRepository.update(id, userId, {
          researchStatus: "FAILED",
        });
      });

    return processingCompany;
  }

  async analyzeCompany(userId: string, name: string, websiteUrl?: string, advancedOptions?: any): Promise<any> {
    const duplicateCount = await this.companyRepository.count(userId, {
      "manualData.name": { $regex: new RegExp(`^${name.trim()}$`, "i") },
    });
    if (duplicateCount > 0) {
      throw new BadRequestError(`A company named "${name}" already exists in your tracking list.`);
    }

    const { AIService } = await import("../../../services/ai.service");
    return AIService.researchCompany(name, websiteUrl, advancedOptions);
  }
}

