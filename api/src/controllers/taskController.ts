import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { logActivity } from "../utils/activityLogger";

export const TaskController = {
  // List tasks in a project
  async list(req: Request, res: Response) {
    const projectId = Number(req.params.projectId);

    const tasks = await prisma.task.findMany({
      where: {
        projectId,
        isActive: true,
      },
      orderBy: {
        order: "asc",
      },
    });

    res.json(tasks);
  },

  // Get single task
  async get(req: Request, res: Response) {
    const projectId = Number(req.params.projectId);
    const taskId = Number(req.params.taskId);

    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        projectId,
        isActive: true,
      },
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json(task);
  },

  // Create task
  async create(req: Request, res: Response) {
    const projectId = Number(req.params.projectId);
    const { title, description, dueDate, priority, status, order } = req.body;

    if (!req.user) return res.sendStatus(401);
    const userId = req.user.id;

    const task = await prisma.task.create({
      data: {
        projectId,
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority: priority || "MEDIUM",
        status: status || "TODO",
        order: order || 0,
        createdBy: userId,
      },
      include: {
        Project: {
          select: { organizationId: true },
        },
      },
    });

    await logActivity({
      organizationId: task.Project.organizationId, // fetch project org
      entityType: "TASK",
      entityId: task.id,
      action: "CREATE",
      performedBy: userId,
      metadata: JSON.stringify({ title, priority, status }),
    });

    res.status(201).json(task);
  },

  // Update task
  async update(req: Request, res: Response) {
    const projectId = Number(req.params.projectId);
    const taskId = Number(req.params.taskId);
    if (!req.user) return res.sendStatus(401);
    const userId = req.user.id;

    const task = await prisma.task.findFirst({
      where: { id: taskId, projectId, isActive: true },
      include: {
        Project: {
          select: { organizationId: true },
        },
      },
    });
    if (!task) return res.status(404).json({ error: "Task not found" });

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: {
        title: req.body.title,
        description: req.body.description,
        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null,
        priority: req.body.priority,
        status: req.body.status,
        order: req.body.order,
        updatedAt: new Date(),
      },
    });

    await logActivity({
      organizationId: task.Project.organizationId,
      entityType: "TASK",
      entityId: task.id,
      action: "UPDATE",
      performedBy: userId,
      metadata: JSON.stringify(req.body),
    });

    res.json(updated);
  },

  // Delete task (soft delete)
  async delete(req: Request, res: Response) {
    const projectId = Number(req.params.projectId);
    const taskId = Number(req.params.taskId);
    if (!req.user) return res.sendStatus(401);
    const userId = req.user.id;

    const task = await prisma.task.findFirst({
      where: { id: taskId, projectId, isActive: true },
      include: {
        Project: {
          select: { organizationId: true },
        },
      },
    });
    if (!task) return res.status(404).json({ error: "Task not found" });

    await prisma.task.update({
      where: { id: taskId },
      data: { isActive: false },
    });

    await logActivity({
      organizationId: task.Project.organizationId,
      entityType: "TASK",
      entityId: task.id,
      action: "DELETE",
      performedBy: userId,
      metadata: JSON.stringify({ title: task.title }),
    });

    res.json({ ok: true });
  },
};
