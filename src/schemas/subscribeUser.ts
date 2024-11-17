import Joi from "joi";

const subscribeUserSchema = Joi.object({
  email: Joi.string()
    .pattern(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/)
    .required()
    .messages({ "any.required": "missing field email" }),
});

export default subscribeUserSchema; 