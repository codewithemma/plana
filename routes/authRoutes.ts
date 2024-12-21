import express, { type Router } from "express";
import {
  register,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
} from "../controllers/authController";
import {
  validateForgotPassword,
  validateRegister,
  validateResetPassword,
  validateVerifyEmail,
} from "../middleware/validationMiddleware";
const router: Router = express.Router();

router.post("/register", validateRegister, register);
router.post("/verify-email", validateVerifyEmail, verifyEmail);
router.post("/login", login);
router.post("/forgot-password", validateForgotPassword, forgotPassword);
router.post("/reset-password", validateResetPassword, resetPassword);

export default router;
