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

const handleDelete = async (id: string) => {
  const oldImage = await prisma.event.findFirst({
    where: {
      id,
    },
  });

  if (oldImage && oldImage.image && oldImage.image.length > 0) {
    const urlParts = oldImage.image.split("/");
    const folderAndPublicId = urlParts.slice(-2).join("/"); // Adjust if folder is deeper
    const publicId = folderAndPublicId.split(".")[0];

    const result = await cloudinary.uploader.destroy(publicId, {
      invalidate: true,
    });

    if (result.result === "ok") {
      return "success";
    } else {
      return "failure";
    }
  } else {
    return "no image to delete";
  }
};

const getAllEvents = async (req: Request, res: Response) => {
  const events = await prisma.event.findMany({});
  res.status(StatusCodes.OK).json({ events });
};

const getSingleEvent = async (req: Request, res: Response) => {
  const { id } = req.params;
  // might add validation
  const event = await prisma.event.findUnique({
    where: {
      id,
    },
  });
  res.status(StatusCodes.OK).json({ event });
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
  const { id } = req.params;
  const { title, description, eventType, location, fee, tags, duration, date } =
    req.body;

  const imageFile = req.files?.image as fileUpload.UploadedFile;

  const tagsArray = Array.isArray(tags) ? tags : tags.split(",");

  const userId = req.user?._id;

  if (!userId) {
    throw new UnAuthorizedError("User not authenticated. Please log in.");
  }

  const event = await prisma.event.findFirst({
    where: {
      id,
    },
    select: {
      organizerId: true,
      image: true,
    },
  });

  if (!event) {
    throw new NotFoundError("Event not found.");
  }

  if (event.organizerId !== userId) {
    throw new UnAuthorizedError("You are unauthorized to update this event.");
  }

  let updatedImageUrl = event.image;

  if (imageFile) {
    const handleDeleteImageFromCloudinary = await handleDelete(id);
    if (handleDeleteImageFromCloudinary === "success") {
      const uploadResponse = await cloudinary.uploader.upload(
        imageFile.tempFilePath,
        {
          upload_preset: process.env.CLOUDINARY_PRESET_NAME,
        }
      );
      updatedImageUrl = uploadResponse.secure_url;
      // Remove temporary file
      fs.unlinkSync(imageFile.tempFilePath);
    } else {
      throw new BadRequestError("Failed to delete old image. Update aborted.");
    }
  }

  // Update the event in the database
  const updatedEvent = await prisma.event.update({
    where: { id },
    data: {
      title,
      description,
      eventType,
      image: updatedImageUrl,
      location,
      fee,
      tags: tagsArray,
      duration,
      date,
      updatedAt: new Date(), // Automatically update the `updatedAt` field
    },
  });

  res.status(StatusCodes.OK).json({
    message: "Event updated successfully",
    updatedEvent,
  });
};

const deleteEvent = async (req: Request, res: Response) => {
  const { id } = req.params;

  const userId = req.user?._id;

  if (!userId) {
    throw new UnAuthorizedError("User not authenticated. Please log in.");
  }

  const getOrganizer = await prisma.event.findFirst({
    where: {
      id,
    },
    select: {
      organizerId: true,
    },
  });

  if (!getOrganizer || getOrganizer.organizerId !== userId) {
    throw new UnAuthorizedError("You are unauthorized to delete this event.");
  }

  const deleteImageFromCloudinary = await handleDelete(id);

  if (deleteImageFromCloudinary === "failure") {
    throw new BadRequestError(
      "An error occurred while deleting the event. Please try again."
    );
  }

  const event = await prisma.event.delete({
    where: {
      id,
    },
  });
  res
    .status(StatusCodes.OK)
    .json({ message: "The event has been successfully deleted." });
};

export { getAllEvents, getSingleEvent, createEvent, updateEvent, deleteEvent };
