import sendEmail from "../config/nodemailer";

const headerColor = "#D9D9D9";
const logoUrl = "/assets/brand.svg";

interface SpeakerRegistrationDetails {
  email: string;
  speakerName: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
}

const sendSpeakerConfirmationMail = async ({
  email,
  speakerName,
  eventName,
  eventDate,
  eventLocation,
}: SpeakerRegistrationDetails) => {
  const messageContent = `
        <p>Dear ${speakerName},</p>
        <p>Thank you for registering as a speaker for <strong>${eventName}</strong>! We’re thrilled to have you on board and look forward to your participation.</p>
        <p>Below are the details of your registration:</p>
        <ul>
          <li><strong>Event Name:</strong> ${eventName}</li>
          <li><strong>Date:</strong> ${eventDate}</li>
          <li><strong>Location:</strong> ${eventLocation}</li>
        </ul>
        <p>We’ll be in touch with additional details, including the agenda, guidelines for speakers, and any resources you might need to prepare.</p>
        <p>If you have any questions or require assistance, feel free to reach out to us at <a href="mailto:support@example.com">support@plana.com</a>.</p>
        <p>Warm regards,</p>
        <p><strong>Your Event Team</strong></p>
      `;

  const buttonHtml = ""; // No button needed for this email

  return sendEmail({
    to: email,
    subject: "Speaker Registration Confirmation",
    html: `   <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <div style="text-align: center; background-color: ${headerColor}; padding: 10px;">
          <img src="${logoUrl}" alt="Event Logo" style="height: 50px;">
        </div>
        <div style="padding: 20px;">
          <h2 style="font-size: 24px;">Speaker Registration Confirmation</h2>
          ${messageContent}
          <div style="text-align: center; margin: 20px 0;">
            ${buttonHtml}
          </div>
          <p style="color: #999; font-size: 12px;">If you did not register as a speaker, please ignore this email or contact our support team immediately.</p>
        </div>
      </div>`,
  });
};

export default sendSpeakerConfirmationMail;
