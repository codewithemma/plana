import { User } from "../userType"; // Import or define your `User` type
declare global {
  namespace Express {
    interface Request {
      user?: User; // Extend the Request interface with the `user` property
    }
  }
}
