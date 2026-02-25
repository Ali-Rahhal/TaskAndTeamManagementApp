import { Router } from "express";
import {
  createComment,
  getTaskComments,
  updateComment,
  deleteComment,
} from "../controllers/taskCommentController.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireOrgRole } from "../middleware/requireOrgRole.js";

const router = Router({ mergeParams: true });

router.use(requireAuth);
router.use(requireOrgRole("MEMBER"));

// GET /organizations/:orgId/projects/:projectId/tasks/:taskId/comments
router.get("/", getTaskComments);

// POST /organizations/:orgId/projects/:projectId/tasks/:taskId/comments
router.post("/", createComment);

// PATCH /organizations/:orgId/projects/:projectId/tasks/:taskId/comments/:commentId
router.patch("/:commentId", updateComment);

// DELETE /organizations/:orgId/projects/:projectId/tasks/:taskId/comments/:commentId
router.delete("/:commentId", deleteComment);

export default router;
