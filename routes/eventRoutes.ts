import express, { Router } from "express";
import {
  createEvent,
  deleteEvent,
  getAllEvents,
  getSingleEvent,
  updateEvent,
} from "../controllers/eventController";
import authenticateUser from "../middleware/authentication";
import premiumFeatureMiddleware from "../middleware/premiumFeatureMiddleware";
import { ValidateEvent } from "../middleware/validationMiddleware";

const router: Router = express.Router();

router.get("/", authenticateUser, getAllEvents);
router.get("/:id", authenticateUser, getSingleEvent);
router.post(
  "/create",
  authenticateUser,
  premiumFeatureMiddleware,
  ValidateEvent,
  createEvent
);
router.put("/update-event/:id", authenticateUser, ValidateEvent, updateEvent);
router.delete("/delete-event/:id", authenticateUser, deleteEvent);

export default router;
