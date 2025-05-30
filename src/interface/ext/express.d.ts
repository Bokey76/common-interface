import { JwtPayload } from "jsonwebtoken";
import { PageParams } from "../common";
import { User, Role } from "@/models";

declare global {
  namespace Express {
    interface Response {
      data?: any;
      message?: string | object;
      code?: number;
    }
    interface Request {
      filteredQuery?: Record<string, any>;
      where?: object;
      order?: any[];
      page?: PageParams | object;
      user?: string | JwtPayload | User | null;
    }
  }
}
