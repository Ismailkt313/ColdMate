import { Request, Response, NextFunction } from "express";
import { ForbiddenError, UnauthorizedError } from "../errors";

export const roleMiddleware = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError("Authentication required"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError("Access denied: Insufficient permissions"));
    }

    next();
  };
};
