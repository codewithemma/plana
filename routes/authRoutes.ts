import express, { type Router } from "express";
import {
  register,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  logout,
  updateEmail,
} from "../controllers/authController";
import {
  validateEmailUpdate,
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
router.post("/update-email", validateEmailUpdate, updateEmail);
router.post("/logout", authenticateUser, logout);

export default router;
