const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: Number(process.env.EMAIL_PORT) === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Verify SMTP connection on server startup
 */
const verifyEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log("✅ Email server connected successfully.");
  } catch (err) {
    console.error("❌ Email server connection failed.");
    console.error(err.message);
  }
};

/**
 * Generic email sender
 */
const sendEmail = async ({
  to,
  subject,
  html,
  text,
}) => {
  try {
    const info = await transporter.sendMail({
      from:
        process.env.EMAIL_FROM ||
        `"Bryson Tyler" <${process.env.EMAIL_USER}>`,

      to,

      subject,

      text,

      html,
    });

    console.log(
      `📧 Email sent to ${to}: ${info.messageId}`
    );

    return info;
  } catch (err) {
    console.error(
      "❌ Email sending failed:"
    );
    console.error(err.message);

    throw err;
  }
};

module.exports = {
  sendEmail,
  verifyEmailConnection,
};