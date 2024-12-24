import express, { Router } from "express";
import {
  getAllUsers,
  getCurrentUser,
  updateCurrentUser,
  updateCurrentUserEmail,
} from "../controllers/userController";
import authenticateUser, {
  authorizePermissions,
} from "../middleware/authentication";
import {
  ValidateEmailUpdate,
  validateUserUpdate,
} from "../middleware/validationMiddleware";

const router: Router = express.Router();

router.get("/", authenticateUser, authorizePermissions("ADMIN"), getAllUsers);
router.get("/current-user", authenticateUser, getCurrentUser);
router.patch(
  "/update-user",
  authenticateUser,
  validateUserUpdate,
  updateCurrentUser
);
router.patch(
  "/update-email",
  authenticateUser,
  ValidateEmailUpdate,
  updateCurrentUserEmail
);

export default router;
