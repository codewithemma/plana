import express, { Router } from "express";
import {
  getAllUsers,
  getCurrentUser,
  updateCurrentUser,
} from "../controllers/userController";
import authenticateUser, {
  authorizePermissions,
} from "../middleware/authentication";

const router: Router = express.Router();

router.get("/", authenticateUser, authorizePermissions("ADMIN"), getAllUsers);
router.get("/current-user", authenticateUser, getCurrentUser);
router.post("/update-user", authenticateUser, updateCurrentUser);

export default router;
