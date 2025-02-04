import { Request, Response, NextFunction } from "express";
import {
  Event,
  EmailUpdate,
  UserEmailUpdate,
  UserForgotPassword,
  UserLogin,
  UserResetPassword,
  UserSchema,
  UserUpdate,
  UserVerifySchema,
  EventSpeakerRegistration,
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

export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  UserLogin.parse(req.body);
  next();
};

export const validateEmailUpdate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  UserEmailUpdate.parse(req.body);
  next();
};

// user validation

export const validateUserUpdate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  UserUpdate.parse(req.body);
  next();
};

export const ValidateEmailUpdate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  EmailUpdate.parse(req.body);
  next();
};

// event validation
export const ValidateEvent = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  Event.parse(req.body);
  next();
};

export const validateRegisterSpeaker = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  EventSpeakerRegistration.parse(req.body);
  next();
};
