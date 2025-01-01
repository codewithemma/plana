import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { StatusCodes } from "http-status-codes";

const errorHandlerMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let customError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    message:
      err.message || "An unexpected error occurred. Please try again later.",
  };

  // handle zod errors
  if (err instanceof ZodError) {
    customError.message = err.errors.map((error) => error.message).join(", ");
    customError.statusCode = StatusCodes.BAD_REQUEST;
  }

  res.status(customError.statusCode).json({ message: customError.message });
};

export default errorHandlerMiddleware;
