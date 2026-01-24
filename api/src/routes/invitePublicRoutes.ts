import { Router } from "express";
import { InviteController } from "../controllers/inviteController";
import { requireAuth } from "../middleware/auth";

const router = Router();

/**
 * /api/invites/:token/accept
 */
router.post("/:token/accept", requireAuth, InviteController.accept);

export default router;
