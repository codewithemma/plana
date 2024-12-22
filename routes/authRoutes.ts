import express, { type Router } from "express";
import {
  register,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  logout,
} from "../controllers/authController";
import {
  validateForgotPassword,
  validateLogin,
  validateRegister,
  validateResetPassword,
  validateVerifyEmail,
} from "../middleware/validationMiddleware";
import authenticateUser from "../middleware/authentication";
const router: Router = express.Router();

router.post("/register", validateRegister, register);
router.post("/verify-email", validateVerifyEmail, verifyEmail);
router.post("/login", validateLogin, login);
router.post("/forgot-password", validateForgotPassword, forgotPassword);
router.post("/reset-password", validateResetPassword, resetPassword);
router.post("/logout", authenticateUser, logout);

export default router;
