import type { Request, Response } from "express";
import crypto from "crypto";
import { prisma } from "../lib/prisma";

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
      const { email, role } = req.body;

      // Prevent duplicate active invite
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
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });

      // 🔥 Here you would send email with invite link
      // https://yourapp.com/invite/${token}

      res.status(201).json(invite);
    } catch {
      res.status(400).json({ error: "Failed to create invite" });
    }
  },

  // Accept invite
  async accept(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const token = req.params.token as string | undefined;

      if (!token) {
        return res.status(400).json({ error: "Token is required" });
      }

      const invite = await prisma.invite.findUnique({
        where: { token },
      });

      if (!invite || invite.acceptedAt || invite.expiresAt < new Date()) {
        return res.status(400).json({ error: "Invalid or expired invite" });
      }

      // Prevent duplicate membership
      const exists = await prisma.organizationMember.findUnique({
        where: {
          userId_organizationId: {
            userId,
            organizationId: invite.organizationId,
          },
        },
      });

      if (exists) {
        return res.status(400).json({ error: "Already a member" });
      }

      await prisma.$transaction([
        prisma.organizationMember.create({
          data: {
            organizationId: invite.organizationId,
            userId,
            role: invite.role,
          },
        }),
        prisma.invite.update({
          where: { id: invite.id },
          data: { acceptedAt: new Date() },
        }),
      ]);

      res.json({ ok: true });
    } catch {
      res.status(400).json({ error: "Failed to accept invite" });
    }
  },

  // Revoke invite
  async remove(req: Request, res: Response) {
    const inviteId = Number(req.params.inviteId);

    await prisma.invite.delete({
      where: { id: inviteId },
    });

    res.json({ ok: true });
  },
};
