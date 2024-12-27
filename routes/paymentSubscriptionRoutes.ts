import express from "express";
import { initiatePayment } from "../controllers/paymentSubscriptionController";
import paymentWebhook from "../webhooks/paymentSubscription";
const router = express.Router();

router.post("/initiate", initiatePayment);
router.post("/webhook", paymentWebhook);

export default router;
