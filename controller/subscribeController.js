const Subscribe = require("../models/subscribe");
const {
  getSubscribeByOwner,
  getSubscribeByEmail,
  createSubscribe,
} = require("../services/subscribeServices");
const handleError = require("../utils/handleErrors");
const { send } = require("../utils/sendGrid");

const addSubscribe = async (req, res, next) => {
  const { _id: owner } = req.user;
  const { email } = req.body;

  const userSub = await getSubscribeByOwner({ owner });
  const emailSub = await getSubscribeByEmail({ email });

  if (userSub) {
    const error = handleError(409, "User is already subscribed");
    return next(error);
  }

  if (emailSub) {
    const error = handleError(409, "The email belongs to another user");
    return next(error);
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

  send(emailToSend);

  res.status(201).json(result);
};

module.exports = addSubscribe;
