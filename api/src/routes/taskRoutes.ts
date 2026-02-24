import { Router } from "express";
import { TaskController } from "../controllers/taskController";
import { requireAuth } from "../middleware/requireAuth";
import { requireOrgRole } from "../middleware/requireOrgRole";
import taskAssigneeRoutes from "./taskAssigneeRoutes";
import taskCommentRoutes from "./taskCommentRoutes";
import taskAttachmentRoutes from "./taskAttachmentRoutes";

const router = Router({ mergeParams: true });

router.use("/:taskId/assignees", taskAssigneeRoutes);

router.use("/:taskId/comments", taskCommentRoutes);

router.use("/:taskId/attachments", taskAttachmentRoutes);

router.use(requireAuth);

/**
 * /organizations/:organizationId/projects/:projectId/tasks
 */

// list tasks
router.get("/", requireOrgRole("MEMBER"), TaskController.list);

// get task
router.get("/:taskId", requireOrgRole("MEMBER"), TaskController.get);

// create task
router.post("/", requireOrgRole("ADMIN"), TaskController.create);

// update task
router.put("/:taskId", requireOrgRole("ADMIN"), TaskController.update);

// delete task
router.delete("/:taskId", requireOrgRole("ADMIN"), TaskController.delete);

export default router;
