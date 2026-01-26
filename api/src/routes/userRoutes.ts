import { Router } from "express";
import { UserController } from "../controllers/userController";
import { requireAuth } from "../middleware/requireAuth";
import { requireRole } from "../middleware/requireRole";

const router = Router();

/**
 * /users
 */

// current user
router.get("/me", requireAuth, UserController.me);

// list all users
router.get(
  "/",
  requireAuth,
  requireRole("ADMIN", "SUPER_ADMIN"),
  UserController.list,
);

// get user by id
router.get(
  "/:userId",
  requireAuth,
  requireRole("ADMIN", "SUPER_ADMIN"),
  UserController.get,
);

// update system role
router.patch(
  "/:userId/role",
  requireAuth,
  requireRole("SUPER_ADMIN"),
  UserController.updateRole,
);

// deactivate user
router.delete(
  "/:userId",
  requireAuth,
  requireRole("ADMIN", "SUPER_ADMIN"),
  UserController.deactivate,
);

export default router;
