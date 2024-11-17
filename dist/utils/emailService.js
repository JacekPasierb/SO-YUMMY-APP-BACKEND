"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSubscriptionEmail = exports.sendVerificationEmail = void 0;
const mail_1 = __importDefault(require("@sendgrid/mail"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
mail_1.default.setApiKey(process.env.SENDGRID_API_KEY);
const sendVerificationEmail = (_a) => __awaiter(void 0, [_a], void 0, function* ({ to, verificationToken, }) {
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
      <p style="font-size:16px;">Verify your e-mail address by clicking on this link - <a href="https://so-yummy-app-backend.vercel.app/api/users/verify/${verificationToken}" target="_blank" rel="noopener noreferrer nofollow"><strong>Verification Link</strong></a></p>
      </div>
    `,
    };
    try {
        yield mail_1.default.send(msg);
        console.log("Verification email sent");
    }
    catch (error) {
        console.error("Error sending verification email:", error.response ? error.response.body : error);
    }
});
exports.sendVerificationEmail = sendVerificationEmail;
const sendSubscriptionEmail = (_a) => __awaiter(void 0, [_a], void 0, function* ({ to, subject, text, html, }) {
    const msg = {
        from: "jack_byk@o2.pl",
        to,
        subject: subject || "Subscription Email",
        text: text || "",
        html: html || "",
    };
    try {
        yield mail_1.default.send(msg);
        console.log("Subscription email sent");
    }
    catch (error) {
        console.error("Error sending subscription email:", error.response ? error.response.body : error);
    }
});
exports.sendSubscriptionEmail = sendSubscriptionEmail;
