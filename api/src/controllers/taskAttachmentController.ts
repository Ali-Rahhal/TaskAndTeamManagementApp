import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { logActivity } from "../utils/activityLogger";

// Create attachment (metadata only — assumes file already uploaded)
export const createAttachment = async (req: Request, res: Response) => {
  try {
    const taskId = Number(req.params.taskId);
    const userId = req.user!.id;
    const { fileName, fileUrl } = req.body;

    if (!fileName || !fileUrl)
      return res.status(400).json({ error: "fileName and fileUrl required" });

    const attachment = await prisma.taskAttachment.create({
      data: { taskId, fileName, fileUrl, uploadedBy: userId },
    });

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { Project: { select: { organizationId: true } } },
    });

    await logActivity({
      organizationId: task!.Project.organizationId,
      entityType: "TASKATTACHMENT",
      entityId: attachment.id,
      action: "CREATE",
      performedBy: userId,
      metadata: JSON.stringify({ attachmentId: attachment.id, fileName }),
    });

    res.status(201).json(attachment);
  } catch {
    res.status(500).json({ error: "Failed to create attachment" });
  }
};

// Get all attachments for a task
export const getTaskAttachments = async (req: Request, res: Response) => {
  try {
    const taskId = Number(req.params.taskId);

    const attachments = await prisma.taskAttachment.findMany({
      where: { taskId },
      include: {
        User: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(attachments);
  } catch {
    res.status(500).json({ error: "Failed to fetch attachments" });
  }
};

// Delete attachment (Uploader OR ADMIN/OWNER)
export const deleteAttachment = async (req: Request, res: Response) => {
  try {
    const attachmentId = Number(req.params.attachmentId);
    const userId = req.user!.id;

    const attachment = await prisma.taskAttachment.findUnique({
      where: { id: attachmentId },
    });
    if (!attachment)
      return res.status(404).json({ error: "Attachment not found" });

    if (
      attachment.uploadedBy !== userId &&
      req.orgRole !== "ADMIN" &&
      req.orgRole !== "OWNER"
    ) {
      return res.status(403).json({ error: "Not allowed" });
    }

    await prisma.taskAttachment.delete({ where: { id: attachmentId } });

    const task = await prisma.task.findUnique({
      where: { id: attachment.taskId },
      include: { Project: { select: { organizationId: true } } },
    });

    await logActivity({
      organizationId: task!.Project.organizationId,
      entityType: "TASKATTACHMENT",
      entityId: attachment.id,
      action: "DELETE",
      performedBy: userId,
      metadata: JSON.stringify({ attachmentId }),
    });

    res.json({ message: "Attachment deleted" });
  } catch {
    res.status(500).json({ error: "Failed to delete attachment" });
  }
};
