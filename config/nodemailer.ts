import nodemailer from "nodemailer";
import BadRequestError from "../errors/bad-request";

interface MailType {
  to: string;
  subject: string;
  html: string;
}

const sendEmail = async ({ to, subject, html }: MailType) => {
  try {
    // Create a transporter object using the default SMTP transport

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

    // Setup email data
    const mailOptions = {
      from: "noreply@plana.com", // sender address
      to, // list of receivers
      subject, // Subject line
      html, // html body
    };

    // Send mail with defined transport object
    transporter.sendMail(mailOptions);
  } catch (error) {
    throw new BadRequestError("Something went wrong while sending email");
  }
};

export default sendEmail;
