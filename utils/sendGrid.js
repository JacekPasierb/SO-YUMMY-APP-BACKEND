// using Twilio SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs

const sgMail = require("@sendgrid/mail");
require("dotenv").config();

const send = (data) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const msg = {...data, from: `jack_byk@o2.pl` };

  sgMail
    .send(msg)
    .then(() => {
      console.log("Email sent");
    })
    .catch((error) => {
      console.error(error);
    });
};


module.exports = {
  send,
};
