import { Request, Response, NextFunction } from "express";

export interface ICompanyController {
  createCompany(req: Request, res: Response, next: NextFunction): Promise<any>;
  getCompanies(req: Request, res: Response, next: NextFunction): Promise<any>;
  getCompanyById(req: Request, res: Response, next: NextFunction): Promise<any>;
  updateCompany(req: Request, res: Response, next: NextFunction): Promise<any>;
  deleteCompany(req: Request, res: Response, next: NextFunction): Promise<any>;
  triggerResearch(req: Request, res: Response, next: NextFunction): Promise<any>;
  analyzeCompany(req: Request, res: Response, next: NextFunction): Promise<any>;
}

