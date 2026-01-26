import type { Request, Response, NextFunction } from "express";
import type { SysRole } from "../types/auth";

export const requireRole =
  (...roles: SysRole[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.sendStatus(401);

    if (!roles.includes(req.user.sysRole)) {
      return res.sendStatus(403);
    }

    next();
  };
