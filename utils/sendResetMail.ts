import sendEmail from "../config/nodemailer";
import { MailProp } from "../types/mailVerificationTypes";

const headerColor = "#D9D9D9";
const logoUrl = "/assets/brand.svg";

const sendResetPasswordEmail = async ({ email, userId }: MailProp) => {
  const resetUrl = `${process.env.ORIGIN}/auth/forgot-password/reset?userid=${userId}&email=${email}`;
  const messageContent = `
    <p>We received a request to reset your password for your Plana account. To ensure the security of your account, we want to confirm that this request was made by you.</p>
    <p>Kindly click on the button below or open in a new tab to reset your password.</p>
    <a href="${resetUrl}" style="margin-top: 5px; text-decoration: none;">${resetUrl}</a>
  `;

  return sendEmail({
    to: email,
    subject: "Password Reset",
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <div style="text-align: center; background-color: ${headerColor}; padding: 10px;">
          <img src="${logoUrl}" alt="Plana Logo" style="height: 50px;">
        </div>
        <div style="padding: 20px;">
          <h2 style="font-size: 24px;">Password Reset</h2>
          ${messageContent}
          <p style="color: #999; font-size: 12px;">If you did not request this, please ignore this message or contact our support team immediately.</p>
        </div>
      </div>`,
  });
};

export default sendResetPasswordEmail;
