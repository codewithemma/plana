import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import { MailProp } from "../types/mailVerificationTypes";
import sendEmail from "../config/nodemailer";
const prisma = new PrismaClient();
const headerColor = "#D9D9D9";
const logoUrl = "/assets/brand.svg";

const sendUpdateMail = async ({ email, userId }: MailProp) => {
  // generate hashed token
  const verificationToken = crypto.randomBytes(40).toString("hex");

  await prisma.nonce.update({
    where: { id: userId },
    data: { email, token: verificationToken },
  });

  const updateUrl = `${process.env.ORIGIN}/auth/verify-email?quid=${verificationToken}&email=${email}`;
  const messageContent = `
        <p>Thank you for signing up for a Mobosure account. To complete your registration, please use the OTP code below:</p>
        <p>Please enter this code on the verification page to activate your account.</p>
        <a href="${updateUrl}" style="margin-top: 5px; text-decoration: none;">${updateUrl}</a>
      `;

  const buttonHtml = ""; // No button needed for OTP verification

  return sendEmail({
    to: email,
    subject: "Email confirmation",
    html: `   <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <div style="text-align: center; background-color: ${headerColor}; padding: 10px;">
          <img src="${logoUrl}" alt="Plana Logo" style="height: 50px;">
        </div>
        <div style="padding: 20px;">
          <h2 style="font-size: 24px;">Email Update</h2>
          ${messageContent}
          <div style="text-align: center; margin: 20px 0;">
            ${buttonHtml}
          </div>
          <p style="color: #999; font-size: 12px;">If you did not request this, please ignore this message or contact our support team immediately.</p>
        </div>
      </div>`,
  });
};

export default sendUpdateMail;
