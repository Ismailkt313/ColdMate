import { Router } from "express";
import { CompanyController } from "../controller/company.controller";
import { CompanyService } from "../service/company.service";
import { CompanyRepository } from "../repository/company.repository";
import { validate } from "../../../middleware/validate.middleware";
import { authMiddleware } from "../../../middleware/auth.middleware";
import {
  createCompanySchema,
  updateCompanySchema,
  getCompaniesQuerySchema,
  analyzeCompanySchema,
} from "../validation/company.validation";


const router = Router();

const companyRepository = new CompanyRepository();
const companyService = new CompanyService(companyRepository);
const companyController = new CompanyController(companyService);

router.post("/", authMiddleware, validate(createCompanySchema), companyController.createCompany);
router.get("/", authMiddleware, validate(getCompaniesQuerySchema), companyController.getCompanies);
router.get("/:id", authMiddleware, companyController.getCompanyById);
router.patch("/:id", authMiddleware, validate(updateCompanySchema), companyController.updateCompany);
router.delete("/:id", authMiddleware, companyController.deleteCompany);
router.post("/:id/research", authMiddleware, companyController.triggerResearch);
router.post("/analyze", authMiddleware, validate(analyzeCompanySchema), companyController.analyzeCompany);


export default router;
