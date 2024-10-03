const Joi = require("joi");

const registerSchema = Joi.object({
  name: Joi.string().min(3).trim().required().messages({
    "string.base": "Name must be a string",
    "string.min": "Name must be at least 3 characters long",
    "any.required": "Name is required",
  }),
  email: Joi.string().email().trim().required().messages({
    "string.base": "E-mail must be a string",
    "string.email": "Enter a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(6).trim().required().messages({
    "string.base": "Password must be a string",
    "string.min": "Password must be at least 6 characters long",
    "any.required": "Password is required",
  }),
});
const updateUserSchema = Joi.object({
  avatar: Joi.string(),
  name: Joi.string().min(3).trim().messages({
    "string.base": "Name must be a string",
    "string.min": "Name must be at least 3 characters long",
  }),
});
const toogleThemeSchema = Joi.object({
  isDarkTheme:Joi.boolean(),
});
const signinSchema = Joi.object({
  email: Joi.string().email().trim().required().messages({
    "string.base": "E-mail must be a string",
    "string.email": "Enter a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(6).trim().required().messages({
    "string.base": "Password must be a string",
    "string.min": "Password must be at least 6 characters long",
    "any.required": "Password is required",
  }),
});

module.exports = { registerSchema, signinSchema, updateUserSchema, toogleThemeSchema };
