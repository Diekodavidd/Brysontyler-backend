
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
const welcomeUserTemplate = require("../templates/email/welcomeFan");
const welcomeCreatorTemplate = require("../templates/email/welcomeCreator");
const creatorApplicationTemplate = require("../templates/email/creatorApplicationReceived");
const adminCreatorApplicationTemplate = require("../templates/email/adminNewCreator");
const profileCompletedTemplate = require("../templates/email/profileCompleted");
const forgotPasswordTemplate = require("../templates/email/forgotPassword");
const creatorRejectedTemplate = require("../templates/email/creatorRejected");
const creatorApprovedTemplate = require("../templates/email/creatorApproved");
// const passwordChangedTemplate = require("../templates/email/passwordChanged");

const sendWelcomeEmail = async (user) => {
  return sendEmail({
    to: user.email,
    subject: "Welcome to Bryson Tyler",
    html: welcomeUserTemplate(user),
  });
};

const notifyAdminNewUser = async (user) => {
  return sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: "New User Registration",
    html: `
      <h2>New User Registered</h2>

      <p><strong>Name:</strong> ${user.name}</p>

      <p><strong>Email:</strong> ${user.email}</p>

      <p><strong>Role:</strong> ${user.role}</p>
    `,
  });
};

const profileCompletedEmail = async (user) => {
  return sendEmail({
    to: user.email,
    subject: "Profile Completed",
    html: profileCompletedTemplate(user),
  });
};

const creatorApplicationReceived = async (user) => {
  return sendEmail({
    to: user.email,
    subject: "Creator Application Received",
    html: creatorApplicationTemplate(user),
  });
};

const notifyAdminCreatorApplication = async (user) => {
  return sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: "New Creator Application",
    html: adminCreatorApplicationTemplate(user),
  });
};

const forgotPasswordEmail = async (user, resetLink) => {
  return sendEmail({
    to: user.email,
    subject: "Reset Your Password",
    html: forgotPasswordTemplate(user, resetLink),
  });
};
const creatorApprovedEmail = async (user) => {
  return sendEmail({
    to: user.email,
    subject: "Creator Application Approved",
    html: creatorApprovedTemplate(user),
  });
};

const creatorRejectedEmail = async (user, reason) => {
  return sendEmail({
    to: user.email,
    subject: "Creator Application Rejected",
    html: creatorRejectedTemplate(user, reason),
  });
};
// const passwordChangedEmail = async (user) => {
//   return sendEmail({
//     to: user.email,
//     subject: "Password Changed",
//     html: passwordChangedTemplate(user),
//   });
// };
module.exports = {
  verifyEmailConnection,
  sendEmail,

  sendWelcomeEmail,
  notifyAdminNewUser,

  profileCompletedEmail,

  forgotPasswordEmail,
  // passwordChangedEmail,
creatorApprovedEmail,
  creatorRejectedEmail,
  creatorApplicationReceived,
  notifyAdminCreatorApplication,
};