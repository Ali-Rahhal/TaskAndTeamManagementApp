import { Router } from "express";
import { OrganizationController } from "../controllers/organizationController.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireOrgRole } from "../middleware/requireOrgRole.js";
import memberRoutes from "./organizationMemberRoutes.js";
import inviteRoutes from "./inviteRoutes.js";
import projectRoutes from "./projectRoutes.js";

const router = Router();

router.use("/:organizationId/members", memberRoutes);

router.use("/:organizationId/invites", inviteRoutes);

router.use("/:organizationId/projects", projectRoutes);

router.use(requireAuth);

// Create organization (any authenticated user)
router.post("/", OrganizationController.create);

// Get my organizations
router.get("/", OrganizationController.listMyOrganizations);

// Get organization by id (member only)
router.get(
  "/:organizationId",
  requireOrgRole("MEMBER"),
  OrganizationController.getById,
);

// Update organization (ADMIN+)
router.put(
  "/:organizationId",
  requireOrgRole("ADMIN"),
  OrganizationController.update,
);

// Delete organization (OWNER only)
router.delete(
  "/:organizationId",
  requireOrgRole("OWNER"),
  OrganizationController.remove,
);

// Get my role in organization
router.get(
  "/:organizationId/me",
  requireOrgRole("MEMBER"),
  OrganizationController.getMyRole,
);

export default router;
