import express from "express";
import { initiatePayment } from "../controllers/paymentSubscriptionController";
import paymentWebhook from "../webhooks/paymentSubscription";
import authenticateUser from "../middleware/authentication";
const router = express.Router();

router.post("/initiate", authenticateUser, initiatePayment);
router.post("/webhook", paymentWebhook);

export default router;
