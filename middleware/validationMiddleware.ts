import { Request, Response, NextFunction } from "express";
import { UserSchema, UserVerifySchema } from "../lib/zod";

export const validateRegister = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  UserSchema.parse(req.body);
  next();
};

export const validateVerifyEmail = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  UserVerifySchema.parse(req.body);
  next();
};
