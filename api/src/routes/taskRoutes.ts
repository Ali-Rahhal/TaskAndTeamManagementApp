import { Router } from "express";
import { TaskController } from "../controllers/taskController.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireOrgRole } from "../middleware/requireOrgRole.js";
import taskAssigneeRoutes from "./taskAssigneeRoutes.js";
import taskCommentRoutes from "./taskCommentRoutes.js";
import taskAttachmentRoutes from "./taskAttachmentRoutes.js";

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
