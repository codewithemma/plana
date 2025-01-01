import { Request, Response, NextFunction } from "express";
import UnAuthorizedError from "../errors/unauthorized-error";

const premiumFeatureMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;

  if (!user || user.role !== "ORGANIZER") {
    throw new UnAuthorizedError(
      "Access denied. A premium subscription is required to use this feature."
    );
  }

  next();
};

export default premiumFeatureMiddleware;
