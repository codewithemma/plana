import express, { type Router } from "express";
import { register, login, verifyEmail } from "../controllers/authController";
import {
  validateRegister,
  validateVerifyEmail,
} from "../middleware/validationMiddleware";
const router: Router = express.Router();

router.post("/register", validateRegister, register);
router.post("/verify-email", validateVerifyEmail, verifyEmail);
router.post("/login", login);

export default router;
