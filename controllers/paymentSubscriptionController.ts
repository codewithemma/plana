import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import prisma from "../config/prisma";
import axios from "axios";
import BadRequestError from "../errors/bad-request";
import UnAuthorizedError from "../errors/unauthorized-error";
import UnauthenticatedError from "../errors/unauthenticated-error";

const initiatePayment = async (req: Request, res: Response) => {
  const { email, amount } = req.body;
  const userId = req.user?._id;

  if (!userId) {
    throw new UnauthenticatedError(
      "Authentication failed. Please log in and try again."
    );
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new UnAuthorizedError("User not authenticated. Please log in.");
  }

  // Check if the user has already subscribed
  if (user.hasPremiumPlan) {
    throw new BadRequestError("You are already subscribed.");
  }

  const response = await axios.post(
    `${process.env.PAYSTACK_BASE_URL}/transaction/initialize`,
    {
      email,
      amount: amount * 100,
      metadata: {
        id: user.id,
        userName: user.username,
        purpose: "Premium Subscription payment",
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
    throw new BadRequestError(
      "Transaction reference is required. Please provide a valid reference."
    );
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
