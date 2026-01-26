import { Router } from "express";
import { OrganizationController } from "../controllers/organizationController";
import { requireAuth } from "../middleware/requireAuth";
import { requireOrgRole } from "../middleware/requireOrgRole";
import inviteRoutes from "./inviteRoutes";

const router = Router();

// Create organization (any authenticated user)
router.post("/", requireAuth, OrganizationController.create);

// Get my organizations
router.get("/", requireAuth, OrganizationController.listMyOrganizations);

// Get organization by id (member only)
router.get(
  "/:orgId",
  requireAuth,
  requireOrgRole("MEMBER"),
  OrganizationController.getById,
);

// Update organization (ADMIN+)
router.put(
  "/:orgId",
  requireAuth,
  requireOrgRole("ADMIN"),
  OrganizationController.update,
);

// Delete organization (OWNER only)
router.delete(
  "/:orgId",
  requireAuth,
  requireOrgRole("OWNER"),
  OrganizationController.remove,
);

// Get my role in organization
router.get(
  "/:orgId/me",
  requireAuth,
  requireOrgRole("MEMBER"),
  OrganizationController.getMyRole,
);

router.use("/:organizationId/invites", inviteRoutes);

export default router;
