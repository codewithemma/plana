import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { StatusCodes } from "http-status-codes";
import ConflictError from "../errors/conflict";
import attachCookiesToResponse from "../utils/jwt";
import NotFoundError from "../errors/not-found";
import { createTokenUser } from "../utils/createTokenUser";
import bcrypt from "bcrypt";
import UnauthenticatedError from "../errors/unauthenticated-error";
import { sendOtpEmail } from "../utils/mailer";

const getAllUsers = async (req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      isVerified: true,
    },
  });
  res.status(StatusCodes.OK).json({ users });
};

const getCurrentUser = async (req: Request, res: Response) => {
  const user = await prisma.user.findFirst({
    where: {
      id: req.user?._id,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      phoneNumber: true,
      username: true,
      email: true,
      role: true,
      isVerified: true,
    },
  });
  res.status(StatusCodes.OK).json({ user });
};

const updateCurrentUser = async (req: Request, res: Response) => {
  const { username, firstName, lastName, phone, oldPassword, newPassword } =
    req.body;

  const user = await prisma.user.findUnique({
    where: {
      id: req.user?._id,
    },
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  let hashedPassword = user.password;

  if (oldPassword) {
    const isPasswordCorrect = await bcrypt.compare(oldPassword, hashedPassword);

    if (!isPasswordCorrect) {
      throw new UnauthenticatedError("Invalid Credentials");
    }
  }

  if (newPassword) {
    const salt = await bcrypt.genSalt(10);
    hashedPassword = await bcrypt.hash(newPassword, salt);
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: req.user?._id,
    },
    // Preserve current data if not updating
    data: {
      username: username || user.username,
      password: hashedPassword,
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName,
      phoneNumber: phone || user.phoneNumber,
    },
  });

  const tokenUser = createTokenUser({
    _id: updatedUser.id,
    username: updatedUser.username,
    role: updatedUser.role,
  });

  attachCookiesToResponse({ res, user: tokenUser, refreshToken: "" });

  res.status(StatusCodes.OK).json({ message: "User updated successfully" });
};

const updateCurrentUserEmail = async (req: Request, res: Response) => {
  const { newEmail } = req.body;

  const existingUser = await prisma.user.findFirst({
    where: {
      email: newEmail,
    },
  });

  if (existingUser) {
    throw new ConflictError(
      "This email is already associated with another account"
    );
  }
  const user = await prisma.user.findUnique({
    where: {
      id: req.user?._id,
    },
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  const nonce = await prisma.$transaction(async (tx) => {
    // Create a nonce for email verification
    const nonce = await tx.nonce.create({
      data: {
        email: newEmail,
        purpose: "UPDATE",
        uid: user.id,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      },
    });
    // Mark the user as unverified
    await tx.user.update({
      where: {
        id: user.id,
      },
      data: {
        isVerified: false,
      },
    });
    return nonce;
  });

  await sendOtpEmail({
    email: newEmail,
    emailType: "UPDATE",
    userId: nonce.id,
  });

  res.status(StatusCodes.OK).json({
    message:
      "We will send a confrimation email to your new email address. The email address change will be effective as soon as you confirm it using the link in the verification email.",
  });
};

export {
  getAllUsers,
  getCurrentUser,
  updateCurrentUser,
  updateCurrentUserEmail,
};
