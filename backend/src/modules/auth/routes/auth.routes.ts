import { Router } from "express";
import { AuthController } from "../controller/auth.controller";
import { AuthService } from "../service/auth.service";
import { UserRepository } from "../repository/user.repository";
import { validate } from "../../../middleware/validate.middleware";
import { authMiddleware } from "../../../middleware/auth.middleware";
import { upload } from "../../../middleware/upload.middleware";
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validation/auth.validation";

const router = Router();

const userRepository = new UserRepository();
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);

router.post("/register", upload.single("profileImage"), validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/logout", authController.logout);
router.post("/refresh-token", authController.refreshToken);
router.post("/google", authController.googleLogin);
router.post("/forgot-password", validate(forgotPasswordSchema), authController.forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), authController.resetPassword);

router.get("/me", authMiddleware, authController.getCurrentUser);
router.patch("/profile", authMiddleware, validate(updateProfileSchema), authController.updateProfile);
router.patch("/change-password", authMiddleware, validate(changePasswordSchema), authController.changePassword);

router.patch("/profile/image", authMiddleware, upload.single("profileImage"), authController.updateProfileImage);
router.delete("/profile/image", authMiddleware, authController.deleteProfileImage);

export default router;
