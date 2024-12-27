import { Request, Response, NextFunction } from "express";
import UnauthenticatedError from "../errors/unauthenticated-error";

const premiumFeatureMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  console.log(user);

  if (!user || user.role !== "ORGANIZER") {
    throw new UnauthenticatedError(
      "You must have a premium subscription to access this feature."
    );
  }

  next();
};

export default premiumFeatureMiddleware;
