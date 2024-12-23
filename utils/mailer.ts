import nodemailer from "nodemailer";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import { generateEmailTemplate } from "./generateEmail";
import BadRequestError from "../errors/bad-request";
const prisma = new PrismaClient();

interface SendOtpEmailParams {
  email: string;
  emailType: "VERIFY" | "RESET";
  userId: string | undefined;
  token?: string;
}

export const sendOtpEmail = async ({
  email,
  emailType,
  userId,
  token,
}: SendOtpEmailParams) => {
  try {
    // generate hashed token
    const hashedToken = crypto.randomInt(100000, 999999).toString();

    if (emailType === "VERIFY") {
      await prisma.nonce.update({
        where: { id: userId },
        data: { email, token: hashedToken },
      });
    }

    const resetUrl = `${process.env.ORIGIN}/auth/forgot-password/reset?userid=${userId}&email=${email}`;

    const verificationUrl = `${process.env.ORIGIN}/auth/verify-email?quid=${token}`;

    let transporter;

    if (process.env.NODE_ENV === "production") {
      // Use Gmail in production
      transporter = nodemailer.createTransport({
        host: process.env.GMAIL_HOST,
        port: Number(process.env.GMAIL_PORT), // Ensure port is a number
        secure: false,
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASSWORD,
        },
      });
    } else {
      // Use Mailtrap in development
      transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_HOST,
        port: Number(process.env.MAILTRAP_PORT),
        auth: {
          user: process.env.MAILTRAP_USER,
          pass: process.env.MAILTRAP_PASSWORD,
        },
      });
    }

    const resetEmail = generateEmailTemplate("reset", resetUrl);

    const verificationEmail = generateEmailTemplate(
      "verify",
      verificationUrl,
      hashedToken
    );

    const mailOptions = {
      from: "noreply@plana.com",
      to: email,
      subject:
        emailType === "VERIFY" ? "Verify your email" : "Reset your password",
      html: emailType === "RESET" ? resetEmail : verificationEmail,
    };

    const mailResponse = await transporter.sendMail(mailOptions);
    return mailResponse;
  } catch (error) {
    console.error("Error in sendOtpEmail:", error); // Log the error
    throw new BadRequestError("Something went wrong");
  }
};
