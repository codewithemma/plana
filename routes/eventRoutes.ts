import express, { Router } from "express";
import {
  createEvent,
  deleteEvent,
  getAllEvents,
  updateEvent,
} from "../controllers/eventController";
import authenticateUser from "../middleware/authentication";
import premiumFeatureMiddleware from "../middleware/premiumFeatureMiddleware";
import { ValidateCreateEvent } from "../middleware/validationMiddleware";

const router: Router = express.Router();

router.get("/", authenticateUser, getAllEvents);
router.post(
  "/create",
  authenticateUser,
  premiumFeatureMiddleware,
  ValidateCreateEvent,
  createEvent
);
router.patch("/update-event", authenticateUser, updateEvent);
router.delete("/delete-event", authenticateUser, deleteEvent);

export default router;
