import { AIService } from "./ai.service";

export interface IDocumentValidationResult {
  isResume: boolean;
  documentType: string;
  confidence: number;
  reason: string;
}

export class DocumentValidationService {
  static async validate(extractedText: string): Promise<IDocumentValidationResult> {
    return AIService.validateDocument(extractedText);
  }
}
