import { IResumeService } from "../interface/resume.service.interface";
import { IResumeRepository } from "../interface/resume.repository.interface";
import { IResume } from "../types";
import { NotFoundError, BadRequestError, DocumentValidationError } from "../../../errors";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
  getPublicIdFromUrl,
  verifyUrlAccessible,
} from "../../../config/cloudinary.config";
import { ResumeExtractorService } from "../../../services/resume-extractor.service";
import { AIService } from "../../../services/ai.service";
import { DocumentValidationService } from "../../../services/document-validation.service";

export class ResumeService implements IResumeService {
  constructor(private resumeRepository: IResumeRepository) { }

  async uploadResume(userId: string, file: Express.Multer.File): Promise<IResume> {
    const existing = await this.resumeRepository.findByUserId(userId);
    if (existing) {
      throw new BadRequestError("You already have a resume uploaded. Use the replace option to update it.");
    }

    return this.processAndSave(userId, file);
  }

  async getResume(userId: string): Promise<IResume> {
    const resume = await this.resumeRepository.findByUserId(userId);
    if (!resume) {
      throw new NotFoundError("No resume found. Please upload your resume.");
    }
    return this.formatResume(resume);
  }

  async getResumeById(id: string): Promise<any> {
    const resume = await this.resumeRepository.findById(id);
    if (!resume) {
      throw new NotFoundError("Resume not found");
    }
    return resume;
  }

  async replaceResume(userId: string, file: Express.Multer.File): Promise<IResume> {
    const existing = await this.resumeRepository.findByUserId(userId);
    if (existing?.resumePublicId) {
      try {
        const resourceType = existing.resumeUrl.includes("/raw/upload/") ? "raw" : "image";
        await deleteFromCloudinary(existing.resumePublicId, resourceType);
      } catch {
        // Non-fatal — proceed even if Cloudinary deletion fails
      }
    }

    return this.processAndSave(userId, file);
  }

  async deleteResume(userId: string): Promise<void> {
    const existing = await this.resumeRepository.findByUserId(userId);
    if (!existing) {
      throw new NotFoundError("No resume found to delete.");
    }

    if (existing.resumePublicId) {
      try {
        const resourceType = existing.resumeUrl.includes("/raw/upload/") ? "raw" : "image";
        await deleteFromCloudinary(existing.resumePublicId, resourceType);
      } catch {
        // Non-fatal
      }
    }

    await this.resumeRepository.deleteByUserId(userId);
  }

  private async processAndSave(userId: string, file: Express.Multer.File): Promise<IResume> {
    const fileExt = file.originalname.split(".").pop() || "pdf";
    const uniqueFilename = `resume_${userId}_${Date.now()}.${fileExt}`;
    const resourceType = "raw";

    const { secure_url, public_id } = await uploadToCloudinary(
      file.buffer,
      "coldmate/resumes",
      resourceType,
      uniqueFilename
    );

    // Verify that the uploaded asset is publicly accessible on the CDN
    const isAccessible = await verifyUrlAccessible(secure_url);
    if (!isAccessible) {
      console.warn(
        `[Warning] The uploaded file could not be verified on the CDN at ${secure_url}. ` +
        "This is likely because your Cloudinary account restricts PDF/ZIP delivery. " +
        "Please check your Cloudinary Security settings in the console to allow PDF previewing."
      );
    }

    const extractedText = await ResumeExtractorService.extractText(
      file.buffer,
      file.mimetype
    );

    // AI Document Validation
    const validationResult = await DocumentValidationService.validate(extractedText);
    
    if (!validationResult.isResume || validationResult.confidence < 70) {
      try {
        await deleteFromCloudinary(public_id, resourceType);
      } catch (err) {
        console.error(`Failed to delete invalid raw file from Cloudinary:`, err);
      }

      let message = "";
      if (validationResult.confidence < 70) {
        message = "We couldn't confidently identify this document as a professional resume. Please upload a valid resume in PDF or DOCX format.";
      } else {
        const readableType = validationResult.documentType
          .toLowerCase()
          .replace(/_/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());
        const vowels = ["a", "e", "i", "o", "u"];
        const startsWithVowel = vowels.includes(readableType.charAt(0).toLowerCase());
        const article = startsWithVowel ? "an" : "a";
        message = `The uploaded document appears to be ${article} ${readableType}. Please upload a professional resume in PDF or DOCX format.`;
      }

      throw new DocumentValidationError(message, validationResult.documentType);
    }

    const parsedData = await AIService.parseResume(extractedText);

    const resume = await this.resumeRepository.upsert(userId, {
      resumeName: file.originalname,
      resumeUrl: secure_url,
      resumePublicId: public_id,
      extractedText,
      parsedData,
      status: "parsed",
      fileSize: file.size,
    });

    return this.formatResume(resume);
  }

  private formatResume(resume: any): IResume {
    const obj = resume.toObject ? resume.toObject() : { ...resume };
    const backendUrl = process.env.BACKEND_URL || "http://localhost:5000";
    obj.resumeUrl = `${backendUrl}/resume/view/${obj._id}`;
    delete obj.extractedText;
    delete obj.resumePublicId;
    return obj;
  }
}
