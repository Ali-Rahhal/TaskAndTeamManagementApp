import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { logActivity } from "../utils/activityLogger";

export const OrganizationController = {
  // Create org + make creator OWNER
  async create(req: Request, res: Response) {
    try {
      if (!req.user) return res.sendStatus(401);
      const userId = req.user.id;
      const { name, slug } = req.body;

      const organization = await prisma.organization.create({
        data: {
          name,
          slug,
          ownerId: userId,
          OrganizationMember: { create: { userId, role: "OWNER" } },
        },
      });

      await logActivity({
        organizationId: organization.id,
        entityType: "ORGANIZATION",
        entityId: organization.id,
        action: "CREATE",
        performedBy: userId,
        metadata: JSON.stringify({ name, slug }),
      });

      res.status(201).json(organization);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  // List orgs user belongs to
  async listMyOrganizations(req: Request, res: Response) {
    if (!req.user) return res.sendStatus(401);
    const userId = req.user.id;

    const orgs = await prisma.organization.findMany({
      where: {
        isActive: true,
        OrganizationMember: {
          some: { userId, isActive: true },
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    res.json(orgs);
  },

  // Get org details
  async getById(req: Request, res: Response) {
    const orgId = Number(req.params.organizationId);

    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: {
        id: true,
        name: true,
        slug: true,
        createdAt: true,
      },
    });

    if (!org) {
      return res.status(404).json({ error: "Organization not found" });
    }

    res.json(org);
  },

  // Update org (ADMIN+)
  async update(req: Request, res: Response) {
    const orgId = Number(req.params.organizationId);
    const { name } = req.body;
    if (!req.user) return res.sendStatus(401);

    const updated = await prisma.organization.update({
      where: { id: orgId },
      data: { name, updatedAt: new Date() },
    });

    await logActivity({
      organizationId: orgId,
      entityType: "ORGANIZATION",
      entityId: orgId,
      action: "UPDATE",
      performedBy: req.user.id,
      metadata: JSON.stringify({ name }),
    });

    res.json(updated);
  },

  // Delete org (OWNER only)
  async remove(req: Request, res: Response) {
    const orgId = Number(req.params.organizationId);
    if (!req.user) return res.sendStatus(401);

    const member = await prisma.organizationMember.findFirst({
      where: { userId: req.user.id, organizationId: orgId },
    });
    if (!member) return res.status(404).json({ error: "Not a member" });

    const deleted = await prisma.organization.update({
      where: { id: orgId },
      data: { isActive: false },
    });

    await logActivity({
      organizationId: orgId,
      entityType: "ORGANIZATION",
      entityId: orgId,
      action: "DELETE",
      performedBy: req.user.id,
      metadata: JSON.stringify({ name: deleted.name }),
    });

    res.json({ ok: true });
  },

  // Get current user's role
  async getMyRole(req: Request, res: Response) {
    if (!req.user) return res.sendStatus(401);
    const userId = req.user.id;
    const orgId = Number(req.params.organizationId);

    const membership = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId: orgId,
        },
      },
      select: {
        role: true,
      },
    });

    if (!membership) {
      return res.status(404).json({ error: "Not a member" });
    }

    res.json({ role: membership.role });
  },
};
