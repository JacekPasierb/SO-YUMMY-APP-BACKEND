const Joi = require("joi");

const recipeSchema = Joi.object({
  preview: Joi.any().required(),
  title: Joi.string().required(),
  description: Joi.string().required(),
  category: Joi.string().required(),
  time: Joi.string().required(),
  ingredients: Joi.array().items().required(),
  instructions: Joi.string().required(),
});

module.exports = recipeSchema;
