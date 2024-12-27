import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { PrismaClient } from "@prisma/client";
import axios from "axios";
import BadRequestError from "../errors/bad-request";
import NotFoundError from "../errors/not-found";
const prisma = new PrismaClient();

const initiatePayment = async (req: Request, res: Response) => {
  const { email, amount } = req.body;
  const userId = req.user?._id;
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  const response = await axios.post(
    `${process.env.PAYSTACK_BASE_URL}/transaction/initialize`,
    {
      email,
      amount: amount * 100,
      metadata: {
        id: user.id, // Custom data for your use case
        userName: user.username, // Optional: Add other relevant information
        purpose: "Premium Subscription payment", // Optional: Describe the transaction purpose
      },
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "content-type": "application/json",
      },
    }
  );
  res.status(StatusCodes.CREATED).json({
    status: "success",
    message: "Payment initialized",
    data: response.data,
  });
};

const verifyPayment = async (reference: string) => {
  if (!reference) {
    throw new BadRequestError("Transaction reference is required.");
  }
  const response = await axios.get(
    `${process.env.PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    }
  );
  return response.data;
};

export { initiatePayment, verifyPayment };