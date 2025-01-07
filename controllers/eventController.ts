import fs from "fs";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import prisma from "../config/prisma";
import BadRequestError from "../errors/bad-request";
import NotFoundError from "../errors/not-found";
import UnAuthorizedError from "../errors/unauthorized-error";
import { cloudinary } from "../config/cloudinary";
import fileUpload from "express-fileupload";
import UnauthenticatedError from "../errors/unauthenticated-error";
import sendSpeakerConfirmationMail from "../utils/sendSpeakerConfirmationMail";

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
  const { title, eventType, location, fee, tags, date, organizerId, search } =
    req.query;

  // Build a dynamic filter object
  const filters: any = {};

  if (typeof search === "string") {
    filters.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { location: { contains: search, mode: "insensitive" } },
      { tags: { has: search } }, // Search exact match in tags
    ];
  }

  if (typeof title === "string") {
    filters.title = { contains: title, mode: "insensitive" }; // Case-insensitive search
  }

  if (typeof eventType === "string") {
    filters.eventType = eventType;
  }

  if (typeof location === "string") {
    filters.location = { contains: location, mode: "insensitive" };
  }

  if (typeof fee === "string") {
    const [minFee, maxFee] = fee.split(",");

    filters.fee = {
      gte: minFee || "0", // Minimum fee as string
      lte: maxFee || "Infinity", // Maximum fee as string
    };
  }

  if (typeof tags === "string") {
    filters.tags = { hasSome: tags.split(",") }; // Filters events that match any of the provided tags
  }

  if (typeof date === "string") {
    const [startDate, endDate] = date.split(",");
    filters.date = {
      gte: startDate ? new Date(startDate) : undefined,
      lte: endDate ? new Date(endDate) : undefined,
    };
  }

  if (typeof organizerId === "string") {
    filters.organizerId = organizerId;
  }

  const events = await prisma.event.findMany({
    where: filters,
  });

  res.status(StatusCodes.OK).json({ events, count: events.length });
};

const getEvent = async (req: Request, res: Response) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new UnauthenticatedError(
      "Authentication failed. Please log in and try again."
    );
  }

  const organizerEvent = await prisma.event.findFirst({
    where: {
      organizerId: userId,
    },
  });

  res.status(StatusCodes.OK).json({ organizerEvent });
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

  await prisma.$transaction(async (tx) => {
    // Find speakers related to the event
    const speakers = await tx.speaker.findMany({
      where: { eventId: id },
    });

    for (const speaker of speakers) {
      if (speaker.image) {
        // Extract public ID from Cloudinary URL
        const urlParts = speaker.image.split("/");
        const folderAndPublicId = urlParts.slice(-2).join("/"); // Adjust if folder is deeper
        const publicId = folderAndPublicId.split(".")[0];

        // Delete speaker image from Cloudinary
        await cloudinary.uploader.destroy(publicId, { invalidate: true });
      }

      // Delete speaker from the database
      await tx.speaker.delete({
        where: { id: speaker.id },
      });
    }

    // Delete event image from Cloudinary
    const deleteImageFromCloudinary = await handleDelete(id);
    if (deleteImageFromCloudinary === "failure") {
      throw new Error("Failed to delete event image from Cloudinary.");
    }

    // Delete the event
    await tx.event.delete({
      where: { id },
    });
  });

  res
    .status(StatusCodes.OK)
    .json({ message: "The event has been successfully deleted." });
};

// speaker
const getEventSpeakers = async (req: Request, res: Response) => {
  const { id } = req.params;
  const speakers = await prisma.speaker.findMany({
    where: {
      eventId: id,
    },
  });
  res.status(StatusCodes.OK).json({ speakers });
};

const registerSpeaker = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, title, email, bio, topic } = req.body;

  // Validate event existence
  const event = await prisma.event.findUnique({
    where: { id },
  });

  if (!event) {
    throw new NotFoundError("Event not found");
  }

  // Check for duplicate speaker registration
  const existingSpeaker = await prisma.speaker.findFirst({
    where: {
      email,
      eventId: id,
    },
  });

  if (existingSpeaker) {
    throw new BadRequestError(
      "You are already registered as a speaker for this event."
    );
  }

  let imageUrl: string | null = null;

  if (req.files?.image) {
    const imageFile = req.files.image as fileUpload.UploadedFile;

    const uploadResponse = await cloudinary.uploader.upload(
      imageFile.tempFilePath,
      {
        upload_preset: process.env.CLOUDINARY_PRESET_NAME,
        folder: "plana_assets",
        use_filename: true,
      }
    );

    if (uploadResponse && uploadResponse.secure_url) {
      imageUrl = uploadResponse.secure_url;
    }

    // Remove temporary file
    if (fs.existsSync(imageFile.tempFilePath)) {
      fs.unlinkSync(imageFile.tempFilePath);
    }
  }

  const speaker = await prisma.speaker.create({
    data: {
      name,
      bio,
      topic,
      email,
      title,
      image: imageUrl,
      eventId: id, // Relate the speaker to the event
    },
  });

  // send email
  await sendSpeakerConfirmationMail({
    email: speaker.email,
    eventDate: event.date.toISOString(),
    eventLocation: event.location,
    eventName: event.title,
    speakerName: speaker.name,
  });

  res.status(StatusCodes.CREATED).json({
    message: "You have successfully registered as a speaker for this event.",
  });
};

export {
  getAllEvents,
  getEvent,
  getSingleEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventSpeakers,
  registerSpeaker,
};
