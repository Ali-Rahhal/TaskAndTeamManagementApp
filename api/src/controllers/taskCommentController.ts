import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { logActivity } from "../utils/activityLogger";

// Create comment
export const createComment = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const taskId = Number(req.params.taskId);
    const { content } = req.body;

    if (!content) return res.status(400).json({ error: "Content is required" });

    const comment = await prisma.taskComment.create({
      data: { content, taskId, userId },
    });

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { Project: { select: { organizationId: true } } },
    });

    await logActivity({
      organizationId: task!.Project.organizationId,
      entityType: "TASKCOMMENT",
      entityId: comment.id,
      action: "CREATE",
      performedBy: userId,
      metadata: JSON.stringify({ commentId: comment.id, content }),
    });

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: `Failed to create comment: ${error}` });
  }
};

// Get all comments for a task
export const getTaskComments = async (req: Request, res: Response) => {
  try {
    const taskId = Number(req.params.taskId);

    const comments = await prisma.taskComment.findMany({
      where: { taskId },
      include: {
        User: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    res.json(comments);
  } catch {
    res.status(500).json({ error: "Failed to fetch comments" });
  }
};

// Update comment (only author)
export const updateComment = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const commentId = Number(req.params.commentId);
    const { content } = req.body;

    const comment = await prisma.taskComment.findUnique({
      where: { id: commentId },
    });
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    if (comment.userId !== userId)
      return res.status(403).json({ error: "Not your comment" });

    const updated = await prisma.taskComment.update({
      where: { id: commentId },
      data: { content },
    });

    const task = await prisma.task.findUnique({
      where: { id: comment.taskId },
      include: { Project: { select: { organizationId: true } } },
    });

    await logActivity({
      organizationId: task!.Project.organizationId,
      entityType: "TASKCOMMENT",
      entityId: comment.id,
      action: "UPDATE",
      performedBy: userId,
      metadata: JSON.stringify({ commentId, content }),
    });

    res.json(updated);
  } catch {
    res.status(500).json({ error: "Failed to update comment" });
  }
};

// Delete comment (author or ADMIN+)
export const deleteComment = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const commentId = Number(req.params.commentId);

    const comment = await prisma.taskComment.findUnique({
      where: { id: commentId },
    });
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    if (
      comment.userId !== userId &&
      req.orgRole !== "ADMIN" &&
      req.orgRole !== "OWNER"
    ) {
      return res.status(403).json({ error: "Not allowed" });
    }

    await prisma.taskComment.delete({ where: { id: commentId } });

    const task = await prisma.task.findUnique({
      where: { id: comment.taskId },
      include: { Project: { select: { organizationId: true } } },
    });

    await logActivity({
      organizationId: task!.Project.organizationId,
      entityType: "TASKCOMMENT",
      entityId: comment.id,
      action: "DELETE",
      performedBy: userId,
      metadata: JSON.stringify({ commentId }),
    });

    res.json({ message: "Comment deleted" });
  } catch {
    res.status(500).json({ error: "Failed to delete comment" });
  }
};
