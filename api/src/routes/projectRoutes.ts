import { Router } from "express";
import { ProjectController } from "../controllers/projectController";
import { requireAuth } from "../middleware/requireAuth";
import { requireOrgRole } from "../middleware/requireOrgRole";
import taskRoutes from "./taskRoutes";

const router = Router({ mergeParams: true });

/**
 * /organizations/:organizationId/projects
 */

// list projects
router.get("/", requireAuth, requireOrgRole("MEMBER"), ProjectController.list);

// get project
router.get(
  "/:projectId",
  requireAuth,
  requireOrgRole("MEMBER"),
  ProjectController.get,
);

// create project
router.post(
  "/",
  requireAuth,
  requireOrgRole("ADMIN"),
  ProjectController.create,
);

// update project
router.put(
  "/:projectId",
  requireAuth,
  requireOrgRole("ADMIN"),
  ProjectController.update,
);

// archive project
router.delete(
  "/:projectId",
  requireAuth,
  requireOrgRole("ADMIN"),
  ProjectController.archive,
);

router.use("/:projectId/tasks", taskRoutes);

export default router;
