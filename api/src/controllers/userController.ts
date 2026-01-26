import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const UserController = {
  // List all users (ADMIN / SUPER_ADMIN)
  async list(req: Request, res: Response) {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        sysRole: true,
        isActive: true,
        createdAt: true,
      },
    });

    res.json(users);
  },

  // Get current user profile
  async me(req: Request, res: Response) {
    if (!req.user) return res.sendStatus(401);
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        sysRole: true,
        isActive: true,
        createdAt: true,
      },
    });

    res.json(user);
  },

  // Get user by id (ADMIN)
  async get(req: Request, res: Response) {
    const id = Number(req.params.userId);

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        sysRole: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  },

  // Update system role (SUPER_ADMIN only)
  async updateRole(req: Request, res: Response) {
    const id = Number(req.params.userId);
    const { sysRole } = req.body;

    const allowedRoles = ["SUPER_ADMIN", "ADMIN", "USER"];
    if (!allowedRoles.includes(sysRole)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { sysRole },
      select: {
        id: true,
        email: true,
        name: true,
        sysRole: true,
      },
    });

    res.json(updated);
  },

  // Soft-disable user (ADMIN / SUPER_ADMIN)
  async deactivate(req: Request, res: Response) {
    const id = Number(req.params.userId);

    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({ ok: true });
  },
};
