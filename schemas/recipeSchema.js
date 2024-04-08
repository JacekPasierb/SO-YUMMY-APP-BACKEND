const Joi = require("joi");

const recipeSchema = Joi.object({
  // preview: Joi.any(),
  // title: Joi.string().required(),
  // instructions: Joi.string().required(),
  // category: Joi.string().required(),
  // time: Joi.string().required(),
  // ingredients: Joi.array().items(),
  // description: Joi.string().required(),
  file:Joi.any(),
  Title:  Joi.string().required(),
  Description: Joi.string().required(),
  Category: Joi.string().required(),
  Time: Joi.string().required(),
  Ingredients:Joi.array().items(),
  Instructions: Joi.string().required(),
  imageUrl:Joi.any(),
  thumb:Joi.any(),
  preview:Joi.any(),
});

module.exports = recipeSchema;
