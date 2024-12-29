import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import bcrypt from "bcrypt";
import crypto from "crypto";
import UnauthenticatedError from "../errors/unauthenticated-error";
import BadRequestError from "../errors/bad-request";
import decodeBase64 from "../utils/decodeBase64";
import hashString from "../utils/createHash";
import { createTokenUser } from "../utils/createTokenUser";
import attachCookiesToResponse from "../utils/jwt";
import sendResetPasswordEmail from "../utils/sendResetMail";
import sendVerificationMail from "../utils/sendVerifcationMail";

const register = async (req: Request, res: Response) => {
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

  await sendVerificationMail({
    email: userToken.email,
    userId: userToken.id,
    token,
  });

  res.status(StatusCodes.OK).json({
    message:
      "We have sent a confirmation email to your email address. Please follow the instructions in the confirmation  email in order to activate your account ",
  });
};

const verifyEmail = async (req: Request, res: Response) => {
  const { otp, quid } = req.body;

  const user = await prisma.nonce.findFirst({
    where: {
      uid: quid,
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

  const savedUser = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
      isVerified: true,
    },
  });

  if (savedUser) {
    await prisma.nonce.deleteMany({
      where: {
        uid: quid,
        token: otp,
        purpose: "VERIFY",
      },
    });
  }

  res.status(StatusCodes.OK).json({
    message:
      "Your account has been confirmed successfull. You can now proceed and sign in to your new account.",
  });
};

const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new BadRequestError("No user found, please sign up");
  }

  const comparePassword = await bcrypt.compare(password, user.password);

  if (!comparePassword) {
    throw new BadRequestError("Incorrect email or password");
  }

  const tokenUser = createTokenUser({
    _id: user.id,
    username: user.username,
    role: user.role,
  });

  // create a fresh token;
  let refreshToken = "";

  const existingRefereshToken = await prisma.token.findFirst({
    where: {
      userId: user.id,
    },
  });

  if (existingRefereshToken) {
    const { isValid } = existingRefereshToken;
    if (!isValid) {
      throw new UnauthenticatedError("Invalid Credentials");
    }
    refreshToken = existingRefereshToken.refreshToken;
    attachCookiesToResponse({ res, user: tokenUser, refreshToken });
    res.status(StatusCodes.OK).json({ user: tokenUser });
    return;
  }

  refreshToken = crypto.randomBytes(40).toString("hex");
  const userAgent = req.headers["user-agent"];
  const ip = req.ip || "0.0.0.0";

  await prisma.token.create({
    data: {
      refreshToken,
      ip,
      userAgent: userAgent || "Unknown",
      userId: user.id,
      isValid: true, // Provide default if required in your schema
    },
  });

  attachCookiesToResponse({ res, user: tokenUser, refreshToken });

  res.status(StatusCodes.OK).json({ user: tokenUser });
};

const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  const emailExist = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!emailExist) {
    throw new BadRequestError("Something went wrong");
  }

  const newToken = await prisma.nonce.create({
    data: {
      email,
      uid: emailExist.id,
      purpose: "RESET",
    },
  });

  const resetToken = hashString(newToken.id);

  await sendResetPasswordEmail({
    email: newToken.email,
    userId: resetToken,
  });

  res.status(StatusCodes.OK).json({ message: "check mail for reset link" });
};

const resetPassword = async (req: Request, res: Response) => {
  const { userId, email, password } = req.body;

  const tokenUser = await prisma.nonce.findFirst({
    where: {
      email,
      purpose: "RESET",
    },
    orderBy: {
      createdAt: "desc", // Ensure the last data is being used
    },
  });

  if (!tokenUser) {
    throw new UnauthenticatedError("You are not authorized to view this page");
  }

  const hashedTokenUser = hashString(tokenUser.id);

  if (userId !== hashedTokenUser) {
    throw new BadRequestError("Something went wrong");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const userPassword = await prisma.user.update({
    where: {
      id: tokenUser.uid,
    },
    data: {
      password: hashedPassword,
    },
  });

  if (userPassword) {
    await prisma.nonce.deleteMany({
      where: {
        uid: tokenUser.uid,
        purpose: "RESET",
      },
    });
  }

  res.status(StatusCodes.OK).json({ message: "Password reset successful" });
};

const updateEmail = async (req: Request, res: Response) => {
  const { verificationToken, email } = req.body;

  const user = await prisma.nonce.findFirst({
    where: {
      email,
      token: verificationToken,
    },
  });

  if (!user) {
    throw new UnauthenticatedError("You are unauthorized to view this page");
  }

  await prisma.$transaction(async (tx) => {
    // Update user verification status
    await tx.user.update({
      where: {
        id: user.uid,
      },
      data: { email, isVerified: true },
    });

    // Delete used nonce
    await tx.nonce.deleteMany({
      where: {
        token: verificationToken,
        purpose: "UPDATE",
      },
    });
  });

  res.status(StatusCodes.OK).json({ message: "Email updated Sucessfully" });
};

const logout = async (req: Request, res: Response) => {
  await prisma.token.deleteMany({
    where: {
      userId: req.user?._id,
    },
  });
  res.cookie("planaAtoken", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.cookie("planaRtoken", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({ msg: "user logged out!" });
};

export {
  register,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
  updateEmail,
  logout,
};
