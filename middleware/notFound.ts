import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

const notFound = (req: Request, res: Response, next: NextFunction): any =>
  res
    .status(StatusCodes.NOT_FOUND)
    .json({ message: "The requested route does not exist." });

export default notFound;
