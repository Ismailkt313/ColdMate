import { Request, Response, NextFunction } from "express";
import { IResumeController } from "../interface/resume.controller.interface";
import { IResumeService } from "../interface/resume.service.interface";
import { ApiResponse } from "../../../utils/api-response.utils";
import { BadRequestError } from "../../../errors";

export class ResumeController implements IResumeController {
  constructor(private resumeService: IResumeService) {}

  uploadResume = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      if (!req.file) {
        throw new BadRequestError("No resume file provided");
      }
      const resume = await this.resumeService.uploadResume(req.user!.id, req.file);
      return ApiResponse.success(res, "Resume uploaded and parsed successfully", { resume }, 201);
    } catch (error) {
      next(error);
    }
  };

  getResume = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const resume = await this.resumeService.getResume(req.user!.id);
      return ApiResponse.success(res, "Resume retrieved successfully", { resume });
    } catch (error) {
      next(error);
    }
  };

  replaceResume = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      if (!req.file) {
        throw new BadRequestError("No resume file provided");
      }
      const resume = await this.resumeService.replaceResume(req.user!.id, req.file);
      return ApiResponse.success(res, "Resume replaced and re-parsed successfully", { resume });
    } catch (error) {
      next(error);
    }
  };

  deleteResume = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      await this.resumeService.deleteResume(req.user!.id);
      return ApiResponse.success(res, "Resume deleted successfully");
    } catch (error) {
      next(error);
    }
  };
}
