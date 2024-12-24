import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

const getAllEvents = async (req: Request, res: Response) => {
  res.send("get all event");
};

const createEvent = async (req: Request, res: Response) => {
  const {
    title,
    description,
    eventType,
    image,
    location,
    fee,
    tags,
    duration,
    date,
  } = req.body;

  res.status(StatusCodes.OK).json({ ...req.body });
};

export { getAllEvents, createEvent };
