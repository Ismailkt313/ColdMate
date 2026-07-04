import { JWTPayload } from "../modules/auth/types";

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}
