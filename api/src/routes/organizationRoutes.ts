import { Router } from "express";
import { OrganizationController } from "../controllers/organizationController";
import { requireAuth } from "../middleware/requireAuth";
import { requireOrgRole } from "../middleware/requireOrgRole";
import inviteRoutes from "./inviteRoutes";
import projectRoutes from "./projectRoutes";

const router = Router();

// Create organization (any authenticated user)
router.post("/", requireAuth, OrganizationController.create);

// Get my organizations
router.get("/", requireAuth, OrganizationController.listMyOrganizations);

// Get organization by id (member only)
router.get(
  "/:organizationId",
  requireAuth,
  requireOrgRole("MEMBER"),
  OrganizationController.getById,
);

// Update organization (ADMIN+)
router.put(
  "/:organizationId",
  requireAuth,
  requireOrgRole("ADMIN"),
  OrganizationController.update,
);

// Delete organization (OWNER only)
router.delete(
  "/:organizationId",
  requireAuth,
  requireOrgRole("OWNER"),
  OrganizationController.remove,
);

// Get my role in organization
router.get(
  "/:organizationId/me",
  requireAuth,
  requireOrgRole("MEMBER"),
  OrganizationController.getMyRole,
);

router.use("/:organizationId/invites", inviteRoutes);

router.use("/:organizationId/projects", projectRoutes);

export default router;
