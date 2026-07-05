import { Request, Response, NextFunction } from "express";
import https from "https";
import { v2 as cloudinary } from "cloudinary";
import { IResumeController } from "../interface/resume.controller.interface";
import { IResumeService } from "../interface/resume.service.interface";
import { ApiResponse } from "../../../utils/api-response.utils";
import { BadRequestError, ForbiddenError } from "../../../errors";

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

  viewResume = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const resume = await this.resumeService.getResumeById(req.params.id);

      if (resume.userId.toString() !== req.user!.id) {
        throw new ForbiddenError("You do not have permission to view this resume");
      }

      const fileExt = resume.resumeName.split(".").pop() || "pdf";
      const isPdf = fileExt.toLowerCase() === "pdf";

      const downloadUrl = cloudinary.utils.private_download_url(
        resume.resumePublicId,
        fileExt,
        {
          resource_type: "raw",
          type: "upload",
        }
      );

      const mimeType = isPdf
        ? "application/pdf"
        : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      
      const disposition = req.query.download === "true" ? "attachment" : "inline";

      res.setHeader("Content-Type", mimeType);
      res.setHeader(
        "Content-Disposition",
        `${disposition}; filename="${encodeURIComponent(resume.resumeName)}"`
      );

      const streamFromUrl = (url: string, redirectCount = 0) => {
        if (redirectCount > 5) {
          return res.status(500).json({ success: false, message: "Too many redirects from storage provider" });
        }

        https.get(url, (cloudinaryRes) => {
          const statusCode = cloudinaryRes.statusCode || 500;
          if (statusCode >= 300 && statusCode < 400 && cloudinaryRes.headers.location) {
            return streamFromUrl(cloudinaryRes.headers.location, redirectCount + 1);
          }

          if (statusCode !== 200) {
            console.error(`Failed to stream from Cloudinary. Status: ${statusCode}`);
            return res.status(statusCode).json({
              success: false,
              message: "Failed to retrieve resume file from storage"
            });
          }

          cloudinaryRes.pipe(res);
        }).on("error", (err) => {
          console.error("Error streaming from Cloudinary:", err);
          if (!res.headersSent) {
            res.status(500).json({ success: false, message: "Internal server error streaming resume" });
          }
        });
      };

      streamFromUrl(downloadUrl);

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
