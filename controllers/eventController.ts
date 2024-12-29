import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { PrismaClient } from "@prisma/client";
import BadRequestError from "../errors/bad-request";
import NotFoundError from "../errors/not-found";
const prisma = new PrismaClient();

const getAllEvents = async (req: Request, res: Response) => {
  const events = await prisma.event.findMany({});
  res.status(StatusCodes.OK).json({ events });
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
    attendees,
    organizerId,
    organizer,
  } = req.body;

  res.status(StatusCodes.OK).json({ ...req.body });
};

export { getAllEvents, createEvent };
