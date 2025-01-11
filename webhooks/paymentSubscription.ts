import { Request, Response } from "express";
import ipaddr from "ipaddr.js";
import crypto from "crypto";
import BadRequestError from "../errors/bad-request";
import prisma from "../config/prisma";
import attachCookiesToResponse from "../utils/jwt";
import UnauthenticatedError from "../errors/unauthenticated-error";
import { StatusCodes } from "http-status-codes";
import sendOrganizerSubscriptionMail from "../utils/sendOrganizerSubscriptionMail";
import { createTokenUser } from "../utils/createTokenUser";
import { verifyPayment } from "../utils/paystack";
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
    const { metadata } = data;

    if (metadata.type === "organizer_subscription") {
      const expectedAmount = 500_000;
      const amountPaid = data.amount;

      if (amountPaid !== expectedAmount) {
        throw new BadRequestError(
          `Payment mismatch: Expected ${expectedAmount} NGN, but received ${amountPaid} NGN.`
        );
      }

      const verification = await verifyPayment(data.reference);

      if (!verification.status || verification.data.status !== "success") {
        throw new BadRequestError("Payment verification failed");
      }

      const userId: string = verification.data.metadata.id;

      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          role: "ORGANIZER",
          hasPremiumPlan: true,
          updatedAt: new Date(),
        },
      });

      const tokenUser = createTokenUser({
        _id: user.id,
        username: user.username,
        role: user.role,
      });
      attachCookiesToResponse({ res, user: tokenUser, refreshToken: "" });
      // send confirmantion mail
      await sendOrganizerSubscriptionMail({
        email: user.email,
        organizerName: user.username,
      });
    } else if (metadata.type === "ticket_purchase") {
      const eventId: string = metadata.id;
      const eventFee = await prisma.event.findUnique({
        where: { id: eventId },
        select: { fee: true },
      });

      console.log("Event Fee:", eventFee);

      if (!eventFee) {
        throw new BadRequestError(
          "The event you are trying to access does not exist or has been removed."
        );
      }

      const expectedAmount = Number(eventFee.fee) * metadata.quantity;

      const amountPaid = data.amount / 100;

      if (amountPaid !== expectedAmount) {
        throw new BadRequestError(
          `Payment mismatch: Expected ${expectedAmount} NGN, but received ${amountPaid} NGN.`
        );
      }

      const verification = await verifyPayment(data.reference);

      // if (verification.data.amount / 100 !== expectedAmount) {
      //   throw new BadRequestError(
      //     "Payment amount mismatch after verification."
      //   );
      // }

      if (!verification.status || verification.data.status !== "success") {
        console.log("Payment verification failed.");
        throw new BadRequestError("Payment verification failed");
      }
      if (!metadata.quantity || !metadata.id || !metadata.username) {
        throw new BadRequestError("Invalid metadata: Missing required fields");
      }
      if (!data.customer || !data.customer.email || !data.reference) {
        throw new BadRequestError("Invalid data: Missing required fields");
      }
      console.log("Starting transaction...");
      //perform database transaction
      // await prisma.$transaction(async (tx) => {
      //   // Register the attendee automatically
      //   const ticket = await tx.ticket.create({
      //     data: {
      //       price: eventFee.fee,
      //       quantity: 2,
      //       eventId: "metadata.id",
      //       name: "General Admission",
      //       description:
      //         "Standard ticket granting access to the event, includes all general sessions and activities.",
      //       paymentReference: "data.reference",
      //       status: "SUCCESS",
      //     },
      //   });
      //   await tx.attendee.create({
      //     data: {
      //       email: "data.customer.email",
      //       name: metadata.username,
      //       eventId: metadata.id,
      //       ticketId: ticket.id,
      //     },
      //   });
      // });

      console.log("Ending transaction...");
    } else {
      console.error("Unhandled metadata.type:", data.metadata.type);
      throw new BadRequestError("Invalid metadata type");
    }
  }
  // console.log(event, data);

  res.sendStatus(StatusCodes.OK);
};
export default paymentWebhook;
