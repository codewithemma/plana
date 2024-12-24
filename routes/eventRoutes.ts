import express, { Router } from "express";
import { createEvent, getAllEvents } from "../controllers/eventController";
import authenticateUser from "../middleware/authentication";

const router: Router = express.Router();

router.get("/", authenticateUser, getAllEvents);
router.post("/create", authenticateUser, createEvent);

export default router;
