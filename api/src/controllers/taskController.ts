import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";

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

    const task = await prisma.task.create({
      data: {
        projectId,
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority: priority || "MEDIUM",
        status: status || "TODO",
        order: order || 0,
        createdBy: req.user!.id,
      },
    });

    res.status(201).json(task);
  },

  // Update task
  async update(req: Request, res: Response) {
    const projectId = Number(req.params.projectId);
    const taskId = Number(req.params.taskId);

    const { title, description, dueDate, priority, status, order } = req.body;

    const task = await prisma.task.findFirst({
      where: { id: taskId, projectId, isActive: true },
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority,
        status,
        order,
        updatedAt: new Date(),
      },
    });

    res.json(updated);
  },

  // Delete task (soft delete)
  async delete(req: Request, res: Response) {
    const projectId = Number(req.params.projectId);
    const taskId = Number(req.params.taskId);

    const task = await prisma.task.findFirst({
      where: { id: taskId, projectId, isActive: true },
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    await prisma.task.update({
      where: { id: taskId },
      data: { isActive: false },
    });

    res.json({ ok: true });
  },
};
