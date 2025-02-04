import { Request, Response } from "express";
import prisma from "../config/prisma";
import { StatusCodes } from "http-status-codes";
import ConflictError from "../errors/conflict";
import attachCookiesToResponse from "../utils/jwt";
import { createTokenUser } from "../utils/createTokenUser";
import bcrypt from "bcrypt";
import UnauthenticatedError from "../errors/unauthenticated-error";
import sendUpdateMail from "../utils/sendUpdateMail";
import UnAuthorizedError from "../errors/unauthorized-error";

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
  const user = await prisma.user.findUnique({
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
    throw new UnAuthorizedError("User not authenticated. Please log in.");
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
    data: {
      username: username,
      password: hashedPassword,
      firstName: firstName,
      lastName: lastName,
      phoneNumber: phone,
      updatedAt: new Date(),
    },
  });

  const tokenUser = createTokenUser({
    _id: updatedUser.id,
    username: updatedUser.username,
    role: updatedUser.role,
  });

  attachCookiesToResponse({ res, user: tokenUser, refreshToken: "" });

  res
    .status(StatusCodes.OK)
    .json({ message: "User details have been successfully updated." });
};

const updateCurrentUserEmail = async (req: Request, res: Response) => {
  const { newEmail } = req.body;

  const existingUser = await prisma.user.findUnique({
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
    throw new UnAuthorizedError("User not authenticated. Please log in.");
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

  await sendUpdateMail({ email: newEmail, userId: nonce.id });

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
