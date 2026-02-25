import { Router } from "express";
import { TaskAssigneeController } from "../controllers/taskAssigneeController.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireOrgRole } from "../middleware/requireOrgRole.js";

const router = Router({ mergeParams: true });

router.use(requireAuth);

/**
 * /organizations/:organizationId/projects/:projectId/tasks/:taskId/assignees
 */

// list assignees
router.get("/", requireOrgRole("MEMBER"), TaskAssigneeController.list);

// assign user
router.post("/", requireOrgRole("ADMIN"), TaskAssigneeController.assign);

// unassign user
router.delete(
  "/:userId",
  requireOrgRole("ADMIN"),
  TaskAssigneeController.unassign,
);

export default router;
