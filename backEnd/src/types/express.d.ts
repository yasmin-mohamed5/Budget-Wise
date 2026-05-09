import { Request } from "express";

export interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: string | JwtPayload;
    }
  }
}