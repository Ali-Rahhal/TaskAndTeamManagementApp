import { Router } from "express";
import { InviteController } from "../controllers/inviteController.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireOrgRole } from "../middleware/requireOrgRole.js";

const router = Router({ mergeParams: true });

router.use(requireAuth);
router.use(requireOrgRole("ADMIN"));

/**
 * /api/organizations/:organizationId/invites
 */

// List invites (ADMIN+)
router.get("/", InviteController.list);

// Create invite (ADMIN+)
router.post("/", InviteController.create);

// Revoke invite (ADMIN+)
router.delete("/:inviteId", InviteController.remove);

export default router;
