const { MailerSend, EmailParams, Sender, Recipient } = require('mailersend');
require('dotenv').config();

console.log("API KEY:", process.env.MAILERSEND_API_KEY);
console.log("FROM EMAIL:", process.env.MAIL_FROM_EMAIL);
console.log("FROM NAME:", process.env.MAIL_FROM_NAME);
const mailerSend = new MailerSend({
apiKey: process.env.MAILERSEND_API_KEY,
});

exports.sendEmail = async ({ to, subject, html }) => {

    

    try {

        const sentFrom = new Sender(

            process.env.MAIL_FROM_EMAIL,

            process.env.MAIL_FROM_NAME

        );

        const recipients = [

            new Recipient(to)

        ];

        const emailParams = new EmailParams()

            .setFrom(sentFrom)

            .setTo(recipients)

            .setSubject(subject)

            .setHtml(html);

        return await mailerSend.email.send(emailParams);

    }

    catch(error){

        console.error(error);

        throw error;

    }

};