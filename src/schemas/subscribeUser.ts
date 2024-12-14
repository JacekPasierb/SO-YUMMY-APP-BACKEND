import Joi from "joi";

const subscribeUserSchema = Joi.object({
  email: Joi.string()
    .pattern(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid email format",
      "any.required": "Email is required",
    }),
});

export default subscribeUserSchema; 