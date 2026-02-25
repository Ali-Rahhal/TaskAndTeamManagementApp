import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { logActivity } from "../utils/activityLogger.js";

export const OrganizationMemberController = {
  // List all members
  async list(req: Request, res: Response) {
    const organizationId = Number(req.params.organizationId);

    const members = await prisma.organizationMember.findMany({
      where: { organizationId, isActive: true },
      select: {
        id: true,
        role: true,
        joinedAt: true,
        User: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.json(members);
  },

  // Add member (direct add, not invite)
  async add(req: Request, res: Response) {
    try {
      const organizationId = Number(req.params.organizationId);
      if (!req.user) return res.sendStatus(401);
      const performedBy = req.user.id;
      const { userId, role } = req.body;

      const exists = await prisma.organizationMember.findUnique({
        where: { userId_organizationId: { userId, organizationId } },
      });

      if (exists)
        return res.status(400).json({ error: "User already a member" });

      const member = await prisma.organizationMember.create({
        data: { organizationId, userId, role: role || "MEMBER" },
      });

      await logActivity({
        organizationId,
        entityType: "MEMBER",
        entityId: member.id,
        action: "CREATE",
        performedBy,
        metadata: JSON.stringify({ userId, role: member.role }),
      });

      res.status(201).json(member);
    } catch {
      res.status(400).json({ error: "Failed to add member" });
    }
  },

  // Change member role
  async updateRole(req: Request, res: Response) {
    const organizationId = Number(req.params.organizationId);
    const memberId = Number(req.params.memberId);
    const { role } = req.body;
    if (!req.user) return res.sendStatus(401);
    const performedBy = req.user.id;

    const member = await prisma.organizationMember.findFirst({
      where: { id: memberId, organizationId },
    });
    if (!member) return res.status(404).json({ error: "Member not found" });
    if (member.role === "OWNER")
      return res.status(400).json({ error: "Cannot change OWNER role" });

    const updated = await prisma.organizationMember.update({
      where: { id: memberId },
      data: { role },
    });

    await logActivity({
      organizationId,
      entityType: "MEMBER",
      entityId: memberId,
      action: "UPDATE",
      performedBy,
      metadata: JSON.stringify({ oldRole: member.role, newRole: role }),
    });

    res.json(updated);
  },

  // Remove member
  async remove(req: Request, res: Response) {
    const organizationId = Number(req.params.organizationId);
    const memberId = Number(req.params.memberId);
    if (!req.user) return res.sendStatus(401);
    const performedBy = req.user.id;

    const member = await prisma.organizationMember.findFirst({
      where: { id: memberId, organizationId },
    });
    if (!member) return res.status(404).json({ error: "Member not found" });
    if (member.role === "OWNER")
      return res.status(400).json({ error: "Cannot remove OWNER" });

    await prisma.organizationMember.update({
      where: { id: memberId },
      data: { isActive: false },
    });

    await logActivity({
      organizationId,
      entityType: "MEMBER",
      entityId: memberId,
      action: "DELETE",
      performedBy,
      metadata: JSON.stringify({ userId: member.userId }),
    });

    res.json({ ok: true });
  },
};
