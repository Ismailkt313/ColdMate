import { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "../errors";
import { JwtUtils } from "../utils/jwt.utils";

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    let token = "";
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.query.token && typeof req.query.token === "string") {
      token = req.query.token;
    }

    if (!token) {
      throw new UnauthorizedError("Access token required");
    }

    const decoded = JwtUtils.verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};
