import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { isEmail } from "validator";
import { z } from "zod";
// import CreateUserDto from "../dtos/create-user";

// const registerSchema = z.object({
//   username: z
//     .string()
//     .min(3, { message: "Username must be at least 3 characters" })
//     .max(30),
//   email: z.string().email({ message: "Invalid email address" }),
//   password: z
//     .string()
//     .min(8, { message: "Password must be at least 8 characters long" })
//     .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/, {
//       message: "Password must include letters and numbers",
//     }),
// });

const register = async (req: Request, res: Response): Promise<any> => {
  const { username, email, password } = req.body;

  const requiredFields = [username, email, password];
  if (requiredFields.some((field) => field.length === 0)) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Please provide all inputs" });
  }

  if (!isEmail(email)) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Please provide a valid email" });
  }

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

  res
    .status(StatusCodes.OK)
    .json({ message: "Please verify your email", userToken });
};

const verifyEmail = async (req: Request, res: Response) => {
  res.send("verify email");
};

const login = async (req: Request, res: Response) => {
  res.send("login");
};

export { register, login };
