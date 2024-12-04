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
const subscribeServices_1 = require("../services/subscribeServices");
const handleErrors_1 = __importDefault(require("../utils/handleErrors"));
const emailService_1 = require("../utils/emailService");
const addSubscribe = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { _id } = req.user;
        const owner = _id.toString();
        const { email } = req.body;
        const userSub = yield (0, subscribeServices_1.getSubscribeByOwner)({ owner });
        const emailSub = yield (0, subscribeServices_1.getSubscribeByEmail)({ email });
        if (userSub) {
            return next((0, handleErrors_1.default)(409, "User is already subscribed"));
        }
        if (emailSub) {
            return next((0, handleErrors_1.default)(409, "The email belongs to another user"));
        }
        const result = yield (0, subscribeServices_1.createSubscribe)({ body: req.body, owner });
        const emailToSend = {
            to: email,
            subject: "SO YUMMY APP subscription",
            html: `
       <div style="text-align: center;">
       <h1>SO YUMMY APP</h1>
       <p style="font-size:16px;">You have subscribed to the So Yummy newsletter</p>
       </div>
       `,
        };
        yield (0, emailService_1.sendSubscriptionEmail)(emailToSend);
        res.status(201).json(Object.assign({ message: "Subscription successful" }, result));
    }
    catch (error) {
        next(error);
    }
});
exports.default = addSubscribe;
