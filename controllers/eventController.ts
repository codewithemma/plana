import fs from "fs";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { PrismaClient } from "@prisma/client";
import BadRequestError from "../errors/bad-request";
import NotFoundError from "../errors/not-found";
import UnAuthorizedError from "../errors/unauthorized-error";
import { cloudinary } from "../config/cloudinary";
import fileUpload from "express-fileupload";
const prisma = new PrismaClient();

const getAllEvents = async (req: Request, res: Response) => {
  const events = await prisma.event.findMany({
    select: {
      _count: true,
      title: true,
      description: true,
      eventType: true,
      image: true,
      location: true,
      fee: true,
      tags: true,
      duration: true,
      date: true,
      attendees: true,
      speakers: true,
    },
  });
  res.status(StatusCodes.OK).json({ events });
};

const createEvent = async (req: Request, res: Response) => {
  const { title, description, eventType, location, fee, tags, duration, date } =
    req.body;

  const organizer = req.user?._id;
  if (!organizer) {
    throw new UnAuthorizedError("You must be logged in to create an event.");
  }

  // Validate image file
  if (!req.files || !req.files.image) {
    throw new BadRequestError("Please upload an image file for the event.");
  }

  // `tags` will come as a comma-separated string if sent via FormData
  const tagsArray = Array.isArray(tags) ? tags : tags.split(",");

  const imageFile = req.files.image as fileUpload.UploadedFile;

  const uploadResponse = await cloudinary.uploader.upload(
    imageFile.tempFilePath,
    {
      upload_preset: process.env.CLOUDINARY_PRESET_NAME,
      folder: "plana_assets",
      use_filename: true,
    }
  );

  // Remove temporary file
  fs.unlinkSync(imageFile.tempFilePath);

  if (!uploadResponse || !uploadResponse.secure_url) {
    throw new BadRequestError(
      "Failed to upload the image. Please try again later."
    );
  }

  const event = await prisma.event.create({
    data: {
      title,
      description,
      eventType,
      image: uploadResponse.secure_url,
      location,
      fee,
      tags: tagsArray,
      duration,
      date,
      organizerId: organizer,
    },
  });

  res
    .status(StatusCodes.OK)
    .json({ message: "Event created successfully", event });
};

const updateEvent = async (req: Request, res: Response) => {
  res.send("update");
};

const deleteEvent = async (req: Request, res: Response) => {
  res.send("delete");
};

export { getAllEvents, createEvent, updateEvent, deleteEvent };
