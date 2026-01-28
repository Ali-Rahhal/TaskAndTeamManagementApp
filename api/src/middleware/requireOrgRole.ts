import type { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { ROLES, type OrgRole } from "../constants/roles";

export const requireOrgRole = (minRole: OrgRole) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return res.sendStatus(401);
      const userId = req.user.id; //The code retrieves the userId property from the request object, which is presumably set by a middleware function that authenticates the user and adds the userId to the request object.
      const orgId = Number(req.params.organizationId);

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

      if (ROLES[membership.role as OrgRole] < ROLES[minRole]) {
        return res.status(403).json({ error: "Insufficient permissions" });
      }

      req.orgRole = membership.role as OrgRole;
      next();
    } catch {
      res.status(500).json({ error: "Authorization failed" });
    }
  };
};
