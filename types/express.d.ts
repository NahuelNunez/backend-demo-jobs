import { JWTPayload } from "../src/modules/auth/auth.model";

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export {};
