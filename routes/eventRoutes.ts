import express, { Router } from "express";
import { createEvent, getAllEvents } from "../controllers/eventController";
import authenticateUser from "../middleware/authentication";
import premiumFeatureMiddleware from "../middleware/premiumFeatureMiddleware";

const router: Router = express.Router();

router.get("/", authenticateUser, getAllEvents);
router.post(
  "/create",
  authenticateUser,
  premiumFeatureMiddleware,
  /* REQ.BODY VALIDATION HERE */ createEvent
);

export default router;
