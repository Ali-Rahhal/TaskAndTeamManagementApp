import { Router } from "express";
import { InviteController } from "../controllers/inviteController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.use(requireAuth);

/**
 * /api/invites/:token/accept
 */
router.post("/:token/accept", InviteController.accept);

export default router;
