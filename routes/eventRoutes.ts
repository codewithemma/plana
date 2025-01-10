import express, { Router } from "express";
const router: Router = express.Router();

// controllers
import {
  attendEvent,
  createEvent,
  deleteEvent,
  getAllEvents,
  getEvent,
  getEventSpeakers,
  getSingleEvent,
  registerSpeaker,
  updateEvent,
} from "../controllers/eventController";

// middleware
import authenticateUser from "../middleware/authentication";
import premiumFeatureMiddleware from "../middleware/premiumFeatureMiddleware";
import {
  ValidateEvent,
  validateRegisterSpeaker,
} from "../middleware/validationMiddleware";

/**
 * Event Routes
 */

// Get all events
router.get("/", getAllEvents);

// Get events created by the authenticated user
router.get("/me", authenticateUser, getEvent);

// Get a single event by its ID
router.get("/:id", getSingleEvent);

// Create a new event (premium feature)
router.post(
  "/create",
  authenticateUser,
  premiumFeatureMiddleware,
  ValidateEvent,
  createEvent
);

// Update an event by its ID
router.put("/update-event/:id", authenticateUser, ValidateEvent, updateEvent);

// Delete an event by its ID
router.delete("/delete-event/:id", authenticateUser, deleteEvent);

/**
 * Speaker Registration Routes
 */

// Get all speakers for an event
router.get("/:id/speakers", getEventSpeakers);

// Register a speaker for an event
router.post(
  "/:id/register-speaker",
  authenticateUser,
  validateRegisterSpeaker,
  registerSpeaker
);

/**
 * Attendee Registration and Payment Routes
 */

// Attend an event and purchase a ticket
router.post("/:id/attend-event", authenticateUser, attendEvent);

export default router;
