import { Request, Response } from "express";
import ipaddr from "ipaddr.js";
import crypto from "crypto";
import BadRequestError from "../errors/bad-request";
import { verifyPayment } from "../controllers/paymentSubscriptionController";
import prisma from "../config/prisma";
import attachCookiesToResponse from "../utils/jwt";
import UnauthenticatedError from "../errors/unauthenticated-error";
import { StatusCodes } from "http-status-codes";
import sendOrganizerSubscriptionMail from "../utils/sendOrganizerSubscriptionMail";
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_IPS = ["52.31.139.75", "52.49.173.169", "52.214.14.220"];

const paymentWebhook = async (req: Request, res: Response) => {
  const clientIp = Array.isArray(req.headers["x-forwarded-for"])
    ? req.headers["x-forwarded-for"][0]
    : req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";

  // ! Validate IP Addresses from Paystack
  const isIpAllowed = PAYSTACK_IPS.some((allowedIP) => {
    if (allowedIP.includes("/")) {
      // Handle CIDR notation
      const [subnet, prefixLength] = allowedIP.split("/");
      const parsedSubnet = ipaddr.parse(subnet);
      const parsedClientIp = ipaddr.parse(clientIp);
      return parsedClientIp.match(parsedSubnet, parseInt(prefixLength, 10));
    } else {
      // Handle specific IP
      return (
        ipaddr.parse(clientIp).toString() === ipaddr.parse(allowedIP).toString()
      );
    }
  });

  if (!isIpAllowed) {
    throw new UnauthenticatedError("Forbidden: Invalid IP Address");
  }

  if (!PAYSTACK_SECRET_KEY) {
    throw new BadRequestError(
      "Payment processing error. Please try again later."
    );
  }

  const hash = crypto
    .createHmac("sha512", PAYSTACK_SECRET_KEY)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (hash !== req.headers["x-paystack-signature"]) {
    throw new BadRequestError("Invalid Paystack signature.");
  }

  const { event, data } = req.body;

  if (event === "charge.success") {
    const expectedAmount = 500_000;
    const amountPaid = data.amount;

    if (amountPaid < expectedAmount) {
      throw new BadRequestError("Insufficient payment amount.");
    }

    const verification = await verifyPayment(data.reference);

    if (!verification.status || verification.data.status !== "success") {
      throw new BadRequestError("Payment verification failed");
    }

    const userId: string = verification.data.metadata.id;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role: "ORGANIZER", hasPremiumPlan: true, updatedAt: new Date() },
    });

    //  not working yet
    attachCookiesToResponse({
      res,
      user: {
        _id: user.id,
        role: "ORGANIZER",
        username: user.username,
      },
      refreshToken: "",
    });

    // send confirmantion mail
    await sendOrganizerSubscriptionMail({
      email: user.email,
      organizerName: user.username,
    });
  }

  res.sendStatus(StatusCodes.OK);
};
export default paymentWebhook;
