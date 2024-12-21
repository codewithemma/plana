import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import bcrypt from "bcrypt";
import { sendOtpEmail } from "../utils/mailer";
import UnauthenticatedError from "../errors/unauthenticated-error";
import BadRequestError from "../errors/bad-request";
import decodeBase64 from "../utils/decodeBase64";

const register = async (req: Request, res: Response): Promise<any> => {
  const { username, email, password } = req.body;

  const emailAlreadyExists = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (emailAlreadyExists) {
    throw new BadRequestError("Email already exists");
  }

  const data = {
    username,
    email,
    password,
  };

  const jsonString = JSON.stringify(data);
  const token = Buffer.from(jsonString).toString("base64");

  const userToken = await prisma.nonce.create({
    data: {
      email,
      purpose: "VERIFY",
      uid: token,
    },
  });

  await sendOtpEmail({
    email: userToken.email,
    emailType: "VERIFY",
    userId: userToken.id,
    token,
  });

  res.status(StatusCodes.OK).json({ message: "Please verify your email" });
};

const verifyEmail = async (req: Request, res: Response) => {
  const { otp, uid } = req.body;

  const user = await prisma.nonce.findFirst({
    where: {
      uid,
      token: otp,
    },
  });

  if (!user) {
    throw new UnauthenticatedError("You are unauthorized to view this page");
  }

  const newUser = decodeBase64(user.uid);
  const { username, email, password } = newUser;

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
      isVerified: true,
    },
  });

  res.status(StatusCodes.OK).json({ message: "Email verified successfully" });
};

const login = async (req: Request, res: Response) => {
  res.send("login");
};

export { register, verifyEmail, login };
