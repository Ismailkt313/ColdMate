import jwt from "jsonwebtoken";
import { JWTPayload } from "../modules/auth/types";
import { UnauthorizedError } from "../errors";

export class JwtUtils {
  static generateAccessToken(payload: JWTPayload): string {
    const secret = process.env.JWT_ACCESS_SECRET || "coldmate_access_secret_key_2026";
    const expiresIn = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
    return jwt.sign(payload, secret, { expiresIn: expiresIn as jwt.SignOptions["expiresIn"] });
  }

  static generateRefreshToken(payload: JWTPayload): string {
    const secret = process.env.JWT_REFRESH_SECRET || "coldmate_refresh_secret_key_2026";
    const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || "7d";
    return jwt.sign(payload, secret, { expiresIn: expiresIn as jwt.SignOptions["expiresIn"] });
  }

  static verifyAccessToken(token: string): JWTPayload {
    try {
      const secret = process.env.JWT_ACCESS_SECRET || "coldmate_access_secret_key_2026";
      return jwt.verify(token, secret) as JWTPayload;
    } catch (error) {
      throw new UnauthorizedError("Invalid or expired access token");
    }
  }

  static verifyRefreshToken(token: string): JWTPayload {
    try {
      const secret = process.env.JWT_REFRESH_SECRET || "coldmate_refresh_secret_key_2026";
      return jwt.verify(token, secret) as JWTPayload;
    } catch (error) {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }
  }
}
