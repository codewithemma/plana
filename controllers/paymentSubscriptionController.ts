import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import prisma from "../config/prisma";
import BadRequestError from "../errors/bad-request";
import UnAuthorizedError from "../errors/unauthorized-error";
import UnauthenticatedError from "../errors/unauthenticated-error";
import { initializePayment } from "../utils/paystack";

const initiatePayment = async (req: Request, res: Response) => {
  const { email, amount } = req.body;

  // todo: schema validation

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

  const paymentData = await initializePayment({
    email,
    amount,
    metadata: {
      id: user.id,
      username: user.username,
      type: "organizer_subscription",
    },
  });

  res.status(StatusCodes.CREATED).json({
    status: "success",
    message: "Payment initialized",
    data: paymentData.data,
  });
};

export { initiatePayment };
