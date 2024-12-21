import { Request, Response, NextFunction } from "express";
import {
  UserForgotPassword,
  UserResetPassword,
  UserSchema,
  UserVerifySchema,
} from "../lib/zod";

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

export const validateForgotPassword = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  UserForgotPassword.parse(req.body);
  next();
};

export const validateResetPassword = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  UserResetPassword.parse(req.body);
  next();
};
