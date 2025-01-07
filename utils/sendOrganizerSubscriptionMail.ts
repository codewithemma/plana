import { MailProp } from "../types/mailVerificationTypes";
import sendEmail from "../config/nodemailer";

const headerColor = "#D9D9D9";
const logoUrl = "/assets/brand.svg";

interface OrganizerSubscriptionDetails {
  email: string;
  organizerName: string;
}

const sendOrganizerSubscriptionMail = async ({
  email,
  organizerName,
}: OrganizerSubscriptionDetails) => {
  const messageContent = `
    <p>Dear ${organizerName},</p>
    <p>Congratulations on becoming an organizer on our platform! We're excited to have you onboard and can’t wait to see the amazing events you’ll create.</p>
    <p>As an organizer, you now have access to exclusive features and tools that will help you plan and manage successful events seamlessly.</p>
    <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>
    <p>Thank you for choosing our platform to showcase your events. Let's create unforgettable experiences together!</p>
  `;

  return sendEmail({
    to: email,
    subject: "Welcome to Our Organizer Program!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <div style="text-align: center; background-color: ${headerColor}; padding: 10px;">
          <img src="${logoUrl}" alt="Platform Logo" style="height: 50px;">
        </div>
        <div style="padding: 20px;">
          <h2 style="font-size: 24px;">Welcome, ${organizerName}!</h2>
          ${messageContent}
          <p style="color: #999; font-size: 12px;">If you did not subscribe to become an organizer, please contact our support team immediately.</p>
        </div>
      </div>
    `,
  });
};

export default sendOrganizerSubscriptionMail;
