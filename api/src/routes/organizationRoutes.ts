import { Router } from "express";
import { OrganizationController } from "../controllers/organizationController";
import { requireAuth } from "../middleware/requireAuth";
import { requireOrgRole } from "../middleware/requireOrgRole";
import memberRoutes from "./organizationMemberRoutes";
import inviteRoutes from "./inviteRoutes";
import projectRoutes from "./projectRoutes";

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
