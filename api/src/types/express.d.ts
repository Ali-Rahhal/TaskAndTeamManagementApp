import { AuthUser } from "./auth.js";
import type { OrgRole } from "../constants/roles.js";

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      orgRole?: OrgRole;
    }
  }
}

export {};
