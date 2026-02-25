import { Router } from "express";
import { ProjectController } from "../controllers/projectController.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireOrgRole } from "../middleware/requireOrgRole.js";
import taskRoutes from "./taskRoutes.js";

const router = Router({ mergeParams: true });

router.use("/:projectId/tasks", taskRoutes);

router.use(requireAuth);

/**
 * /organizations/:organizationId/projects
 */

// list projects
router.get("/", requireOrgRole("MEMBER"), ProjectController.list);

// get project
router.get("/:projectId", requireOrgRole("MEMBER"), ProjectController.get);

// create project
router.post("/", requireOrgRole("ADMIN"), ProjectController.create);

// update project
router.put("/:projectId", requireOrgRole("ADMIN"), ProjectController.update);

// archive project
router.delete(
  "/:projectId",
  requireOrgRole("ADMIN"),
  ProjectController.archive,
);

export default router;
