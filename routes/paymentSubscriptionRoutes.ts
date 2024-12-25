import express from "express";
import {
  initiatePayment,
  verifyPayment,
} from "../controllers/paymentSubscriptionController";
const router = express.Router();

router.post("/initiate", initiatePayment);
router.post("/verify", verifyPayment);
// router.get("/status", getSubscriptionStatus);

export default router;
