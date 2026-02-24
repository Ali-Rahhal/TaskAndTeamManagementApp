import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { logActivity } from "../utils/activityLogger";

export const ProjectController = {
  // List projects in an organization
  async list(req: Request, res: Response) {
    const organizationId = Number(req.params.organizationId);

    const projects = await prisma.project.findMany({
      where: {
        organizationId,
        isActive: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(projects);
  },

  // Get single project
  async get(req: Request, res: Response) {
    const organizationId = Number(req.params.organizationId);
    const projectId = Number(req.params.projectId);

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        organizationId,
        isActive: true,
      },
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json(project);
  },

  // Create project
  async create(req: Request, res: Response) {
    const organizationId = Number(req.params.organizationId);
    const userId = req.user!.id;
    const { name, description } = req.body;

    const project = await prisma.project.create({
      data: { organizationId, name, description },
    });

    // Log creation
    await logActivity({
      organizationId,
      entityType: "PROJECT",
      entityId: project.id,
      action: "CREATE",
      metadata: JSON.stringify({ name, description }),
      performedBy: userId,
    });

    res.status(201).json(project);
  },

  // Update project
  async update(req: Request, res: Response) {
    const organizationId = Number(req.params.organizationId);
    const projectId = Number(req.params.projectId);
    const userId = req.user!.id;
    const { name, description, isArchived } = req.body;

    const project = await prisma.project.findFirst({
      where: { id: projectId, organizationId },
    });

    if (!project) return res.status(404).json({ error: "Project not found" });

    const updated = await prisma.project.update({
      where: { id: projectId },
      data: { name, description, isArchived, updatedAt: new Date() },
    });

    // Log update
    await logActivity({
      organizationId,
      entityType: "PROJECT",
      entityId: projectId,
      action: "UPDATE",
      metadata: JSON.stringify({ name, description, isArchived }),
      performedBy: userId,
    });

    res.json(updated);
  },

  // Archive project (soft delete)
  async archive(req: Request, res: Response) {
    const organizationId = Number(req.params.organizationId);
    const projectId = Number(req.params.projectId);
    const userId = req.user!.id;

    const project = await prisma.project.findFirst({
      where: { id: projectId, organizationId },
    });

    if (!project) return res.status(404).json({ error: "Project not found" });

    await prisma.project.update({
      where: { id: projectId },
      data: { isArchived: true },
    });

    // Log archive/delete
    await logActivity({
      organizationId,
      entityType: "PROJECT",
      entityId: projectId,
      action: "DELETE",
      metadata: JSON.stringify({ name: project.name }),
      performedBy: userId,
    });

    res.json({ ok: true });
  },
};
