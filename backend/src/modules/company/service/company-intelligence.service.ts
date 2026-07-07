import { IAIResearch } from "../types";
import { AIService } from "../../../services/ai.service";

export class CompanyIntelligenceService {
  /**
   * Performs AI-powered intelligence research for a given company name and optional website.
   * Delegates calls to the core AIService which routes it to the active GroqProvider.
   */
  static async researchCompany(name: string, websiteUrl?: string): Promise<IAIResearch> {
    return AIService.researchCompany(name, websiteUrl);
  }
}
