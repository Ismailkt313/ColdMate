import { Request, Response, NextFunction } from "express";
import { IAuthController } from "../interface/auth.controller.interface";
import { IAuthService } from "../interface/auth.service.interface";
import { ApiResponse } from "../../../utils/api-response.utils";
import { UnauthorizedError, BadRequestError } from "../../../errors";
import { uploadToCloudinary } from "../../../config/cloudinary.config";

export class AuthController implements IAuthController {
  private readonly COOKIE_NAME = "refreshToken";
  private readonly REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

  constructor(private authService: IAuthService) {}

  register = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      let registerData = { ...req.body };
      
      if (req.file) {
        const uploadResult = await uploadToCloudinary(req.file.buffer);
        registerData.profileImage = uploadResult.secure_url;
      }
      
      const result = await this.authService.register(registerData);

      this.setCookie(res, result.refreshToken);

      return ApiResponse.success(
        res,
        "User registered successfully",
        { user: result.user, accessToken: result.accessToken },
        201
      );
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login(email, password);

      this.setCookie(res, result.refreshToken);

      return ApiResponse.success(
        res,
        "Login successful",
        { user: result.user, accessToken: result.accessToken }
      );
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      this.clearCookie(res);
      return ApiResponse.success(res, "Logged out successfully");
    } catch (error) {
      next(error);
    }
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const token = req.cookies[this.COOKIE_NAME];
      if (!token) {
        throw new UnauthorizedError("Refresh token is missing");
      }

      const result = await this.authService.refreshToken(token);
      return ApiResponse.success(res, "Access token refreshed successfully", result);
    } catch (error) {
      next(error);
    }
  };

  getCurrentUser = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const userId = req.user!.id;
      const user = await this.authService.getCurrentUser(userId);

      return ApiResponse.success(res, "Current user fetched successfully", { user });
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const userId = req.user!.id;
      const updatedUser = await this.authService.updateProfile(userId, req.body);

      return ApiResponse.success(res, "Profile updated successfully", { user: updatedUser });
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const userId = req.user!.id;
      const { currentPassword, newPassword } = req.body;

      await this.authService.changePassword(userId, currentPassword, newPassword);

      return ApiResponse.success(res, "Password changed successfully");
    } catch (error) {
      next(error);
    }
  };

  updateProfileImage = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      if (!req.file) {
        throw new BadRequestError("No image file uploaded");
      }
      const userId = req.user!.id;
      const updatedUser = await this.authService.updateProfileImage(userId, req.file.buffer);

      return ApiResponse.success(res, "Profile image updated successfully", { user: updatedUser });
    } catch (error) {
      next(error);
    }
  };

  deleteProfileImage = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const userId = req.user!.id;
      const updatedUser = await this.authService.deleteProfileImage(userId);

      return ApiResponse.success(res, "Profile image removed successfully", { user: updatedUser });
    } catch (error) {
      next(error);
    }
  };

  googleLogin = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const { idToken } = req.body;
      if (!idToken) {
        throw new BadRequestError("Google ID token is required");
      }
      const result = await this.authService.googleLogin(idToken);
      this.setCookie(res, result.refreshToken);

      return ApiResponse.success(res, "Google Sign In successful", {
        user: result.user,
        accessToken: result.accessToken,
      });
    } catch (error) {
      next(error);
    }
  };

  forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const { email } = req.body;
      await this.authService.forgotPassword(email);

      return ApiResponse.success(
        res,
        "If an account with that email exists, we have sent a password reset link to it."
      );
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const { email, token, password } = req.body;
      await this.authService.resetPassword(email, token, password);

      return ApiResponse.success(res, "Password reset successfully. You can now log in with your new password.");
    } catch (error) {
      next(error);
    }
  };

  private setCookie(res: Response, token: string): void {
    const isProduction = process.env.NODE_ENV === "production";
    res.cookie(this.COOKIE_NAME, token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: this.REFRESH_TOKEN_MAX_AGE,
    });
  }

  private clearCookie(res: Response): void {
    const isProduction = process.env.NODE_ENV === "production";
    res.clearCookie(this.COOKIE_NAME, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    });
  }
}
