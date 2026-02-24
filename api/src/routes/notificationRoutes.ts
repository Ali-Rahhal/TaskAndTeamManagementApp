import { Router } from "express";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from "../controllers/notificationController";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

router.use(requireAuth);

// GET /notifications
router.get("/", getNotifications);

// PATCH /notifications/:notificationId/read
router.patch("/:notificationId/read", markAsRead);

// PATCH /notifications/read-all
router.patch("/read-all", markAllAsRead);

export default router;
