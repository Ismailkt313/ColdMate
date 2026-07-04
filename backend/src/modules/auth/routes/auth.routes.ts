import { Router } from "express";
import { AuthController } from "../controller/auth.controller";
import { AuthService } from "../service/auth.service";
import { UserRepository } from "../repository/user.repository";
import { validate } from "../../../middleware/validate.middleware";
import { authMiddleware } from "../../../middleware/auth.middleware";
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
} from "../validation/auth.validation";

const router = Router();

// Instantiate components using Dependency Injection (D in SOLID)
const userRepository = new UserRepository();
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/logout", authController.logout);
router.post("/refresh-token", authController.refreshToken);

router.get("/me", authMiddleware, authController.getCurrentUser);
router.patch("/profile", authMiddleware, validate(updateProfileSchema), authController.updateProfile);
router.patch("/change-password", authMiddleware, validate(changePasswordSchema), authController.changePassword);

export default router;
