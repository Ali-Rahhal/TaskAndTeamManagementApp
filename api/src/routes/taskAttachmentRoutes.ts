import { Router } from "express";
import {
  createAttachment,
  getTaskAttachments,
  deleteAttachment,
} from "../controllers/taskAttachmentController";
import { requireAuth } from "../middleware/requireAuth";
import { requireOrgRole } from "../middleware/requireOrgRole";

const router = Router({ mergeParams: true });

router.use(requireAuth);
router.use(requireOrgRole("MEMBER"));

// GET /organizations/:orgId/projects/:projectId/tasks/:taskId/attachments
router.get("/", getTaskAttachments);

// POST /organizations/:orgId/projects/:projectId/tasks/:taskId/attachments
router.post("/", createAttachment);

// DELETE /organizations/:orgId/projects/:projectId/tasks/:taskId/attachments/:attachmentId
router.delete("/:attachmentId", deleteAttachment);

export default router;
