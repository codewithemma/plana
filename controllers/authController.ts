import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { UserSchema } from "../lib/zod";
import { sendOtpEmail } from "../utils/mailer";
// import CreateUserDto from "../dtos/create-user";

const register = async (req: Request, res: Response): Promise<any> => {
  const { username, email, password } = req.body;

  const result = UserSchema.safeParse(req.body);
  if (!result.success) {
    // Handle validation errors
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ errors: result.error.errors });
  }

  const validatedData = result.data;

  const emailAlreadyExists = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (emailAlreadyExists) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "Email already exists",
    });
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

  res.status(StatusCodes.OK).json({ otp, uid });
};

const login = async (req: Request, res: Response) => {
  res.send("login");
};

export { register, verifyEmail, login };
