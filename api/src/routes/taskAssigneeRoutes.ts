import { Router } from "express";
import { TaskAssigneeController } from "../controllers/taskAssigneeController";
import { requireAuth } from "../middleware/requireAuth";
import { requireOrgRole } from "../middleware/requireOrgRole";

const router = Router({ mergeParams: true });

/**
 * /organizations/:organizationId/projects/:projectId/tasks/:taskId/assignees
 */

// list assignees
router.get(
  "/",
  requireAuth,
  requireOrgRole("MEMBER"),
  TaskAssigneeController.list,
);

// assign user
router.post(
  "/",
  requireAuth,
  requireOrgRole("ADMIN"),
  TaskAssigneeController.assign,
);

// unassign user
router.delete(
  "/:userId",
  requireAuth,
  requireOrgRole("ADMIN"),
  TaskAssigneeController.unassign,
);

export default router;
