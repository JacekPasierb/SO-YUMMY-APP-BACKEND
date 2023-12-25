const sgMail = require("@sendgrid/mail");
require("dotenv").config();

const send = async (email, verificationToken) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const msg = {
    to: email,
    from: "jack_byk@o2.pl",
    subject: "SO YUMMY APP weryfikacja adresu e-mail",
    text: "Łatwe nawet z użyciem Node.js",
    html: `
      <div style="text-align: center;">
        <h1>SO YUMMY APP</h1>
        <p style="font-size:16px;">Zweryfikuj swój adres e-mail, klikając w ten link - <a href="https://so-yummy-app-backend.vercel.app/api/users/verify/${verificationToken}" target="_blank" rel="noopener noreferrer nofollow"><strong>Link weryfikacyjny</strong></a></p>
      </div>
    `,
  };

  try {
    const wyslane = await sgMail.send(msg);
    console.log("E-mail wysłany");
    return { sukces: true };
  } catch (error) {
    console.error(error);
    return { sukces: false };
  }
};

module.exports = {
  send,
};
