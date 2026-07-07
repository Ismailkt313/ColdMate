import { Request, Response, NextFunction } from "express";
import { ICompanyController } from "../interface/company.controller.interface";
import { ICompanyService } from "../interface/company.service.interface";
import { ApiResponse } from "../../../utils/api-response.utils";
import { UnauthorizedError, BadRequestError } from "../../../errors";

export class CompanyController implements ICompanyController {
  constructor(private companyService: ICompanyService) {}

  createCompany = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedError("Authentication required");
      }
      const company = await this.companyService.createCompany(req.user.id, req.body);
      return ApiResponse.success(res, "Company created successfully", company, 201);
    } catch (error) {
      next(error);
    }
  };

  getCompanies = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedError("Authentication required");
      }
      const result = await this.companyService.getCompanies(req.user.id, req.query);
      return ApiResponse.success(res, "Companies retrieved successfully", result);
    } catch (error) {
      next(error);
    }
  };

  getCompanyById = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedError("Authentication required");
      }
      const company = await this.companyService.getCompanyById(req.params.id, req.user.id);
      return ApiResponse.success(res, "Company retrieved successfully", company);
    } catch (error) {
      next(error);
    }
  };

  updateCompany = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedError("Authentication required");
      }
      const company = await this.companyService.updateCompany(req.params.id, req.user.id, req.body);
      return ApiResponse.success(res, "Company updated successfully", company);
    } catch (error) {
      next(error);
    }
  };

  deleteCompany = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedError("Authentication required");
      }
      await this.companyService.deleteCompany(req.params.id, req.user.id);
      return ApiResponse.success(res, "Company deleted successfully");
    } catch (error) {
      next(error);
    }
  };

  triggerResearch = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedError("Authentication required");
      }
      const company = await this.companyService.triggerResearch(req.params.id, req.user.id);
      return ApiResponse.success(res, "Company research triggered successfully", company);
    } catch (error) {
      next(error);
    }
  };

  analyzeCompany = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedError("Authentication required");
      }
      const { name, website, advancedOptions } = req.body;
      if (!name) {
        throw new BadRequestError("Company name is required");
      }
      const research = await this.companyService.analyzeCompany(req.user.id, name, website, advancedOptions);

      return ApiResponse.success(res, "Company analyzed successfully", research);
    } catch (error) {
      next(error);
    }
  };
}

