import { Router } from "express";
import { ResumeController } from "../controller/resume.controller";
import { ResumeService } from "../service/resume.service";
import { ResumeRepository } from "../repository/resume.repository";
import { authMiddleware } from "../../../middleware/auth.middleware";
import { resumeUpload } from "../../../middleware/resume-upload.middleware";

const router = Router();

const resumeRepository = new ResumeRepository();
const resumeService = new ResumeService(resumeRepository);
const resumeController = new ResumeController(resumeService);

router.post("/upload", authMiddleware, resumeUpload.single("resume"), resumeController.uploadResume);
router.get("/", authMiddleware, resumeController.getResume);
router.get("/view/:id", authMiddleware, resumeController.viewResume);
router.patch("/", authMiddleware, resumeUpload.single("resume"), resumeController.replaceResume);
router.delete("/", authMiddleware, resumeController.deleteResume);

export default router;
