import { Router } from "express";
import { InviteController } from "../controllers/inviteController";
import { requireAuth } from "../middleware/requireAuth";
import { requireOrgRole } from "../middleware/requireOrgRole";

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
