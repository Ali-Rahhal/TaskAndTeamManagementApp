import { Router } from "express";
import { UserController } from "../controllers/userController.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";

const router = Router();

router.use(requireAuth);

/**
 * /users
 */

// current user
router.get("/me", UserController.me);

// list all users
router.get("/", requireRole("ADMIN", "SUPER_ADMIN"), UserController.list);

// get user by id
router.get("/:userId", requireRole("ADMIN", "SUPER_ADMIN"), UserController.get);

// update system role
router.patch(
  "/:userId/role",
  requireRole("SUPER_ADMIN"),
  UserController.updateRole,
);

// deactivate user
router.delete(
  "/:userId",
  requireRole("ADMIN", "SUPER_ADMIN"),
  UserController.deactivate,
);

export default router;
