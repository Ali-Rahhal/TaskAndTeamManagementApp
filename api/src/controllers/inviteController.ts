import type { Request, Response } from "express";
import crypto from "crypto";
import { prisma } from "../lib/prisma.js";
import { logActivity } from "../utils/activityLogger.js";

export const InviteController = {
  // List invites for an organization
  async list(req: Request, res: Response) {
    const organizationId = Number(req.params.organizationId);

    const invites = await prisma.invite.findMany({
      where: {
        organizationId,
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        email: true,
        role: true,
        expiresAt: true,
        createdAt: true,
      },
    });

    res.json(invites);
  },

  // Create invite
  async create(req: Request, res: Response) {
    try {
      const organizationId = Number(req.params.organizationId);
      const performedBy = req.user!.id;
      const { email, role } = req.body;

      const existing = await prisma.invite.findFirst({
        where: {
          organizationId,
          email,
          acceptedAt: null,
          expiresAt: { gt: new Date() },
        },
      });

      if (existing) {
        return res.status(400).json({ error: "Invite already exists" });
      }

      const token = crypto.randomBytes(32).toString("hex");

      const invite = await prisma.invite.create({
        data: {
          organizationId,
          email,
          role: role || "MEMBER",
          token,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      // Log creation
      await logActivity({
        organizationId,
        entityType: "INVITE",
        entityId: invite.id,
        action: "CREATE",
        metadata: JSON.stringify({ email: invite.email, role: invite.role }),
        performedBy,
      });

      res.status(201).json(invite);
    } catch (err: any) {
      res.status(400).json({ error: `Failed to create invite: ${err}` });
    }
  },

  // Accept invite
  async accept(req: Request, res: Response) {
    try {
      if (!req.user) return res.sendStatus(401);
      const userId = req.user.id;
      const token = req.params.token as string | undefined;

      if (!token) return res.status(400).json({ error: "Token is required" });

      const invite = await prisma.invite.findUnique({ where: { token } });

      if (!invite || invite.acceptedAt || invite.expiresAt < new Date()) {
        return res.status(400).json({ error: "Invalid or expired invite" });
      }

      const exists = await prisma.organizationMember.findUnique({
        where: {
          userId_organizationId: {
            userId,
            organizationId: invite.organizationId,
          },
        },
      });

      if (exists) return res.status(400).json({ error: "Already a member" });

      await prisma.organizationMember.create({
        data: {
          organizationId: invite.organizationId,
          userId,
          role: invite.role,
        },
      });
      await prisma.invite.update({
        where: { id: invite.id },
        data: { acceptedAt: new Date() },
      });
      // Log acceptance
      await logActivity({
        organizationId: invite.organizationId,
        entityType: "INVITE",
        entityId: invite.id,
        action: "UPDATE",
        metadata: JSON.stringify({ acceptedBy: userId }),
        performedBy: userId,
      });

      res.json({ ok: true });
    } catch {
      res.status(400).json({ error: "Failed to accept invite" });
    }
  },

  // Revoke invite
  async remove(req: Request, res: Response) {
    const performedBy = req.user!.id;
    const inviteId = Number(req.params.inviteId);

    const invite = await prisma.invite.findUnique({ where: { id: inviteId } });
    if (!invite) return res.status(404).json({ error: "Invite not found" });

    await prisma.invite.delete({ where: { id: inviteId } });

    logActivity({
      organizationId: invite.organizationId,
      entityType: "INVITE",
      entityId: invite.id,
      action: "DELETE",
      metadata: JSON.stringify({ email: invite.email, role: invite.role }),
      performedBy,
    });

    res.json({ ok: true });
  },
};
