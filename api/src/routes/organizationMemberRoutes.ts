import { Router } from "express";
import { OrganizationMemberController } from "../controllers/organizationMemberController";
import { requireAuth } from "../middleware/auth";
import { requireOrgRole } from "../middleware/organizationRole";

const router = Router({ mergeParams: true });

/**
 * /api/organizations/:organizationId/members
 */

// List members (MEMBER+)
router.get(
  "/",
  requireAuth,
  requireOrgRole("MEMBER"),
  OrganizationMemberController.list,
);

// Add member directly (ADMIN+)
router.post(
  "/",
  requireAuth,
  requireOrgRole("ADMIN"),
  OrganizationMemberController.add,
);

// Update member role (OWNER only)
router.patch(
  "/:memberId/role",
  requireAuth,
  requireOrgRole("OWNER"),
  OrganizationMemberController.updateRole,
);

// Remove member (OWNER only)
router.delete(
  "/:memberId",
  requireAuth,
  requireOrgRole("OWNER"),
  OrganizationMemberController.remove,
);

export default router;
