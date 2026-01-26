import { AuthUser } from "./auth";
import type { OrgRole } from "../constants/roles";

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      orgRole?: OrgRole;
    }
  }
}

export {};
