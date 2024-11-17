import { Request, Response, NextFunction } from "express";
import {
  getSubscribeByOwner,
  getSubscribeByEmail,
  createSubscribe,
} from "../services/subscribeServices";
import handleError from "../utils/handleErrors";
import { IUser } from "../models/user";
import { sendSubscriptionEmail } from "../utils/emailService";

const addSubscribe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(handleError(401, "Unauthorized"));
    }

    const { _id } = req.user as IUser;
    const owner = _id.toString();
    const { email } = req.body;

    const userSub = await getSubscribeByOwner({ owner });
    const emailSub = await getSubscribeByEmail({ email });

    if (userSub) {
      return next(handleError(409, "User is already subscribed"));
    }

    if (emailSub) {
      return next(handleError(409, "The email belongs to another user"));
    }

    const result = await createSubscribe({ body: req.body, owner });

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

    await sendSubscriptionEmail(emailToSend);

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export default addSubscribe;
