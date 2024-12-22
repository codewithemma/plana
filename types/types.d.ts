import { User } from "./userType";
import { Request } from "express";
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
