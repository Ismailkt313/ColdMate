import { Request, Response, NextFunction } from "express";

export interface IResumeController {
  uploadResume(req: Request, res: Response, next: NextFunction): Promise<any>;
  getResume(req: Request, res: Response, next: NextFunction): Promise<any>;
  viewResume(req: Request, res: Response, next: NextFunction): Promise<any>;
  replaceResume(req: Request, res: Response, next: NextFunction): Promise<any>;
  deleteResume(req: Request, res: Response, next: NextFunction): Promise<any>;
}
