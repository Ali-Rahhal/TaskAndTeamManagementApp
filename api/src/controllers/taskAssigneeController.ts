import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const TaskAssigneeController = {
  // List assignees of a task
  async list(req: Request, res: Response) {
    const taskId = Number(req.params.taskId);

    const assignees = await prisma.taskAssignee.findMany({
      where: { taskId },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.json(assignees);
  },

  // Assign user to task
  async assign(req: Request, res: Response) {
    const taskId = Number(req.params.taskId);
    const { userId } = req.body;

    // ensure task exists and is active
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        isActive: true,
      },
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    try {
      const assignee = await prisma.taskAssignee.create({
        data: {
          taskId,
          userId,
        },
      });

      res.status(201).json(assignee);
    } catch {
      // unique(taskId, userId)
      res.status(400).json({ error: "User already assigned to task" });
    }
  },

  // Unassign user from task
  async unassign(req: Request, res: Response) {
    const taskId = Number(req.params.taskId);
    const userId = Number(req.params.userId);

    await prisma.taskAssignee.delete({
      where: {
        taskId_userId: {
          taskId,
          userId,
        },
      },
    });

    res.json({ ok: true });
  },
};
