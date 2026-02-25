import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

// Get all notifications for the logged-in user
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: `Failed to fetch notifications: ${err}` });
  }
};

// Mark a notification as read
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const notificationId = Number(req.params.notificationId);

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.userId !== userId) {
      return res.status(404).json({ error: "Notification not found" });
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    res.json(updated);
  } catch {
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
};

// Optional: Mark all notifications as read
export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to mark all notifications as read" });
  }
};
