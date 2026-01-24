import { Router } from "express";
import { InviteController } from "../controllers/inviteController";
import { requireAuth } from "../middleware/auth";
import { requireOrgRole } from "../middleware/organizationRole";

const router = Router({ mergeParams: true });

/**
 * /api/organizations/:organizationId/invites
 */

// List invites (ADMIN+)
router.get("/", requireAuth, requireOrgRole("ADMIN"), InviteController.list);

// Create invite (ADMIN+)
router.post("/", requireAuth, requireOrgRole("ADMIN"), InviteController.create);

// Revoke invite (ADMIN+)
router.delete(
  "/:inviteId",
  requireAuth,
  requireOrgRole("ADMIN"),
  InviteController.remove,
);

export default router;
