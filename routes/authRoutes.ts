import express, { type Router } from "express";
import { register, login, verifyEmail } from "../controllers/authController";
const router: Router = express.Router();

router.post("/register", register);
router.post("/verify-email", verifyEmail);
router.post("/login", login);

export default router;
