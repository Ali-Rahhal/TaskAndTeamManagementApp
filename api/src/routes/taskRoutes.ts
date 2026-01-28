import { Router } from "express";
import { TaskController } from "../controllers/taskController";
import { requireAuth } from "../middleware/requireAuth";
import { requireOrgRole } from "../middleware/requireOrgRole";
import taskAssigneeRoutes from "./taskAssigneeRoutes";

const router = Router({ mergeParams: true });

/**
 * /organizations/:organizationId/projects/:projectId/tasks
 */

// list tasks
router.get("/", requireAuth, requireOrgRole("MEMBER"), TaskController.list);

// get task
router.get(
  "/:taskId",
  requireAuth,
  requireOrgRole("MEMBER"),
  TaskController.get,
);

// create task
router.post("/", requireAuth, requireOrgRole("ADMIN"), TaskController.create);

// update task
router.put(
  "/:taskId",
  requireAuth,
  requireOrgRole("ADMIN"),
  TaskController.update,
);

// delete task
router.delete(
  "/:taskId",
  requireAuth,
  requireOrgRole("ADMIN"),
  TaskController.delete,
);

router.use("/:taskId/assignees", taskAssigneeRoutes);

export default router;
