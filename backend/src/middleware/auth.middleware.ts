import { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "../errors";
import { JwtUtils } from "../utils/jwt.utils";

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("Access token required");
    }

    const token = authHeader.split(" ")[1];
    const decoded = JwtUtils.verifyAccessToken(token);

    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};
