const Brevo = require("@getbrevo/brevo");
require("dotenv").config();

console.log("API KEY:", process.env.BREVO_API_KEY);
console.log("FROM EMAIL:", process.env.MAIL_FROM_EMAIL);
console.log("FROM NAME:", process.env.MAIL_FROM_NAME);

const apiInstance = new Brevo.TransactionalEmailsApi();

apiInstance.setApiKey(
  Brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

exports.sendEmail = async ({ to, subject, html }) => {
  try {
    const sendSmtpEmail = new Brevo.SendSmtpEmail();

    sendSmtpEmail.subject = subject;

    sendSmtpEmail.htmlContent = html;

    sendSmtpEmail.sender = {
      name: process.env.MAIL_FROM_NAME,
      email: process.env.MAIL_FROM_EMAIL,
    };

    sendSmtpEmail.to = [
      {
        email: to,
      },
    ];

    return await apiInstance.sendTransacEmail(sendSmtpEmail);
  } catch (error) {
    console.error(error.response?.body || error);
    throw error;
  }
};