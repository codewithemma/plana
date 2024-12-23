import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import ConflictError from "../errors/conflict";
import attachCookiesToResponse from "../utils/jwt";
import NotFoundError from "../errors/not-found";
import { createTokenUser } from "../utils/createTokenUser";
import bcrypt from "bcrypt";
import UnauthenticatedError from "../errors/unauthenticated-error";
import { sendOtpEmail } from "../utils/mailer";
const prisma = new PrismaClient();
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
  res.status(StatusCodes.OK).json({ user: req.user });
};

const updateCurrentUser = async (req: Request, res: Response) => {
  const { username, newEmail, oldPassword, newPassword } = req.body;

  //todo:  validate req.body

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

  const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError("Invalid Credentials");
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  const updatedUser = await prisma.user.update({
    where: {
      id: req.user?._id,
    },
    data: {
      username: username || user.username, // Preserve current username if not updating
      email: newEmail || user.email, // Preserve current email if not updating
      password: hashedPassword || user.password,
      isVerified: newEmail ? false : user.isVerified, // Toggle verification only if email changes
    },
  });

  const tokenUser = createTokenUser(updatedUser);
  attachCookiesToResponse({ res, user: tokenUser, refreshToken: "" });

  // todo: create token for user before sending mail

  // send verification mail
  newEmail
    ? await sendOtpEmail({
        email: newEmail,
        emailType: "VERIFY",
        userId: req.user?._id,
      })
    : null;

  res.status(StatusCodes.OK).json({
    message: newEmail
      ? `Check your inbox to verify email`
      : "user updated successfully",
  });
};

export { getAllUsers, getCurrentUser, updateCurrentUser };
