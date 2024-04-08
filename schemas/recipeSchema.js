const Joi = require("joi");

const recipeSchema = Joi.object({
  preview: Joi.any(),
  title: Joi.string().required(),
  instructions: Joi.string().required(),
  category: Joi.string().required(),
  time: Joi.string().required(),
  ingredients: Joi.array().items(),
  description: Joi.string().required(),
});

module.exports = recipeSchema;
