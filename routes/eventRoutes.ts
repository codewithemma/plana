import express, { Router } from "express";
import {
  createEvent,
  deleteEvent,
  getAllEvents,
  getEvent,
  getEventSpeakers,
  getSingleEvent,
  registerSpeaker,
  updateEvent,
} from "../controllers/eventController";
import authenticateUser from "../middleware/authentication";
import premiumFeatureMiddleware from "../middleware/premiumFeatureMiddleware";
import {
  ValidateEvent,
  validateRegisterSpeaker,
} from "../middleware/validationMiddleware";

const router: Router = express.Router();

router.get("/", getAllEvents);
router.get("/me", authenticateUser, getEvent);
router.get("/:id", getSingleEvent);
router.post(
  "/create",
  authenticateUser,
  premiumFeatureMiddleware,
  ValidateEvent,
  createEvent
);
router.put("/update-event/:id", authenticateUser, ValidateEvent, updateEvent);
router.delete("/delete-event/:id", authenticateUser, deleteEvent);

// speaker registration
router.get("/:id/speakers", getEventSpeakers);
router.post(
  "/:id/register-speaker",
  authenticateUser,
  validateRegisterSpeaker,
  registerSpeaker
);

export default router;
