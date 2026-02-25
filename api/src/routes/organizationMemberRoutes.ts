import { Router } from "express";
import { OrganizationMemberController } from "../controllers/organizationMemberController.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireOrgRole } from "../middleware/requireOrgRole.js";

const router = Router({ mergeParams: true });

router.use(requireAuth);

/**
 * /api/organizations/:organizationId/members
 */

// List members (MEMBER+)
router.get("/", requireOrgRole("MEMBER"), OrganizationMemberController.list);

// Add member directly (ADMIN+)
router.post("/", requireOrgRole("ADMIN"), OrganizationMemberController.add);

// Update member role (OWNER only)
router.patch(
  "/:memberId/role",
  requireOrgRole("OWNER"),
  OrganizationMemberController.updateRole,
);

// Remove member (OWNER only)
router.delete(
  "/:memberId",
  requireOrgRole("OWNER"),
  OrganizationMemberController.remove,
);

export default router;
