export const generateEmailTemplate = (
  type: string,
  link = "",
  otpValue = ""
) => {
  const headerColor = "#D9D9D9";
  const buttonColor = "#D9D9D9";
  const logoUrl = "/assets/brand.svg";

  let messageContent = "";
  let buttonLabel = "";
  let buttonHtml = "";

  if (type === "reset") {
    messageContent = `
        <p>We received a request to reset your password for your Plana account. To ensure the security of your account, we want to confirm that this request was made by you.</p>
        <p>Kindly click on the button below or open in a new tab to reset your password.</p>
        <a href="${link}" style="margin-top: 5px; text-decoration: none;">${link}</a>
      `;
    buttonLabel = "Reset Password";
    buttonHtml = `<a href="${link}" style="background-color: ${buttonColor}; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">${buttonLabel}</a>`;
  } else if (type === "verify") {
    messageContent = `
        <p>Thank you for signing up for a Mobosure account. To complete your registration, please use the OTP code below:</p>
        <p style="font-size: 20px; font-weight: bold;">${otpValue}</p>
        <p>Please enter this code on the verification page to activate your account.</p>
        <a href="${link}" style="margin-top: 5px; text-decoration: none;">${link}</a>
      `;
    buttonHtml = ""; // No button needed for OTP verification
  } else {
    messageContent = `
    <p>Thank you for signing up for a Mobosure account. To complete your registration, please use the OTP code below:</p>
    <p>Please enter this code on the verification page to activate your account.</p>
    <a href="${link}" style="margin-top: 5px; text-decoration: none;">${link}</a>
  `;
    buttonHtml = ""; // No button needed for OTP verification
  }

  return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <div style="text-align: center; background-color: ${headerColor}; padding: 10px;">
          <img src="${logoUrl}" alt="Plana Logo" style="height: 50px;">
        </div>
        <div style="padding: 20px;">
          <h2 style="font-size: 24px;">${
            type === "reset" ? "Password Reset" : "OTP Verification"
          }</h2>
          ${messageContent}
          <div style="text-align: center; margin: 20px 0;">
            ${buttonHtml}
          </div>
          <p style="color: #999; font-size: 12px;">If you did not request this, please ignore this message or contact our support team immediately.</p>
        </div>
      </div>
    `;
};
