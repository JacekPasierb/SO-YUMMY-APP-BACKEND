import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";

dotenv.config();

interface VerificationEmailOptions {
  to: string;
  verificationToken: string; // Zawsze wymagany
}

interface GeneralEmailOptions {
  to: string;
  subject?: string;
  text?: string;
  html?: string;
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

const sendVerificationEmail = async ({
  to,
  verificationToken,
}: VerificationEmailOptions): Promise<void> => {
  if (!verificationToken) {
    throw new Error("Verification token is required.");
  }

  const msg = {
    from: "jack_byk@o2.pl",
    to,
    subject: "SO YUMMY APP email verification",
    html: `
    <div style="text-align: center;">
    <h1>SO YUMMY APP</h1>
    <p style="font-size:16px;">Verify your e-mail address by clicking on this link - <a href="https://so-yummy-app-backend-9mvu.vercel.app/api/users/verify/${verificationToken}" target="_blank" rel="noopener noreferrer nofollow"><strong>Verification Link</strong></a></p>
    </div>
    `,
  };

  try {
    await sgMail.send(msg);
  } catch (error: any) {
    console.error(
      "Error sending verification email:",
      error.response ? error.response.body : error
    );
  }
};

const sendSubscriptionEmail = async ({
  to,
  subject,
  text,
  html,
}: GeneralEmailOptions): Promise<void> => {
  const msg = {
    from: "jack_byk@o2.pl",
    to,
    subject: subject || "Subscription Email",
    text: text || "",
    html: html || "",
  };

  try {
    await sgMail.send(msg);
    console.log("Subscription email sent");
  } catch (error: any) {
    console.error(
      "Error sending subscription email:",
      error.response ? error.response.body : error
    );
  }
};

export {sendVerificationEmail, sendSubscriptionEmail};
