import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { logActivity } from "../utils/activityLogger";

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

    if (!req.user) return res.sendStatus(401);
    const performedBy = req.user.id;

    const task = await prisma.task.findFirst({
      where: { id: taskId, isActive: true },
      include: {
        Project: {
          select: { organizationId: true },
        },
      },
    });
    if (!task) return res.status(404).json({ error: "Task not found" });

    const assignee = await prisma.taskAssignee.create({
      data: { taskId, userId },
    });

    await logActivity({
      organizationId: task.Project.organizationId,
      entityType: "TASKASSIGNEE",
      entityId: assignee.id,
      action: "CREATE",
      performedBy,
      metadata: JSON.stringify({ assignedUserId: userId }),
    });

    res.status(201).json(assignee);
  },

  // Unassign user from task
  async unassign(req: Request, res: Response) {
    const taskId = Number(req.params.taskId);
    const userId = Number(req.params.userId);
    if (!req.user) return res.sendStatus(401);
    const performedBy = req.user.id;

    const task = await prisma.task.findFirst({
      where: { id: taskId, isActive: true },
      include: {
        Project: {
          select: { organizationId: true },
        },
      },
    });
    if (!task) return res.status(404).json({ error: "Task not found" });

    const assignee = await prisma.taskAssignee.findFirst({
      where: { taskId, userId },
      select: { id: true },
    });
    if (!assignee) return res.status(404).json({ error: "Assignee not found" });

    await prisma.taskAssignee.delete({
      where: { taskId_userId: { taskId, userId } },
    });

    await logActivity({
      organizationId: task.Project.organizationId,
      entityType: "TASKASSIGNEE",
      entityId: assignee.id,
      action: "DELETE",
      performedBy,
      metadata: JSON.stringify({ unassignedUserId: userId }),
    });

    res.json({ ok: true });
  },
};
