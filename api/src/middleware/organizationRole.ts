import type { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { ROLES, type Role } from "../constants/roles";

export const requireOrgRole = (minRole: Role) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).userId; //The code retrieves the userId property from the request object, which is presumably set by a middleware function that authenticates the user and adds the userId to the request object.
      const orgId = Number(req.params.orgId);

      if (!orgId) {
        return res.status(400).json({ error: "Organization ID required" });
      }

      const membership = await prisma.organizationMember.findUnique({
        where: {
          userId_organizationId: {
            userId,
            organizationId: orgId,
          },
        },
      });

      if (!membership || !membership.isActive) {
        return res
          .status(403)
          .json({ error: "Not a member of this organization" });
      }

      if (ROLES[membership.role as Role] < ROLES[minRole]) {
        return res.status(403).json({ error: "Insufficient permissions" });
      }

      (req as any).orgRole = membership.role;
      next();
    } catch {
      res.status(500).json({ error: "Authorization failed" });
    }
  };
};
