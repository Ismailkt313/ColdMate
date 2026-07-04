import { Request, Response, NextFunction } from "express";

export interface IAuthController {
  register(req: Request, res: Response, next: NextFunction): Promise<any>;
  login(req: Request, res: Response, next: NextFunction): Promise<any>;
  logout(req: Request, res: Response, next: NextFunction): Promise<any>;
  refreshToken(req: Request, res: Response, next: NextFunction): Promise<any>;
  getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<any>;
  updateProfile(req: Request, res: Response, next: NextFunction): Promise<any>;
  changePassword(req: Request, res: Response, next: NextFunction): Promise<any>;
  updateProfileImage(req: Request, res: Response, next: NextFunction): Promise<any>;
  deleteProfileImage(req: Request, res: Response, next: NextFunction): Promise<any>;
  googleLogin(req: Request, res: Response, next: NextFunction): Promise<any>;
  forgotPassword(req: Request, res: Response, next: NextFunction): Promise<any>;
  resetPassword(req: Request, res: Response, next: NextFunction): Promise<any>;
}
