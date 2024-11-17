import Joi from "joi";

const recipeSchema = Joi.object({
  file: Joi.any(),
  title: Joi.string().required(),
  description: Joi.string().required(),
  category: Joi.string().required(),
  time: Joi.string().required(),
  ingredients: Joi.array(),
  instructions: Joi.string().required(),
  imageUrl: Joi.any(),
  thumb: Joi.any(),
  preview: Joi.any(),
});

export default recipeSchema; 