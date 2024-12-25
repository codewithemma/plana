import express, { Router } from "express";
import { createEvent, getAllEvents } from "../controllers/eventController";
import authenticateUser, {
  authorizePermissions,
} from "../middleware/authentication";
import premiumFeatureMiddleware from "../middleware/premiumFeatureMiddleware";

const router: Router = express.Router();

router.get("/", authenticateUser, authorizePermissions("ADMIN"), getAllEvents);
router.post("/create", authenticateUser, premiumFeatureMiddleware, createEvent);

export default router;
