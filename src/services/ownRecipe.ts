import { Types } from "mongoose";
import Recipe from "../models/recipe";

const fetchOwnRecipes = async (
  userId: Types.ObjectId,
  page: number,
  limit: number
) => {
  const skip = (page - 1) * limit;

  const totalOwnRecipes = await Recipe.countDocuments({ owner: userId });
  const recipes = await Recipe.find({ owner: userId }).skip(skip).limit(limit);

  return { recipes, totalOwnRecipes };
};

const createRecipe = async (recipeData: object) => {
  return await Recipe.create(recipeData);
};

const deleteRecipeById = async (recipeId: string) => {
  return await Recipe.findByIdAndDelete(recipeId);
};

export { fetchOwnRecipes, createRecipe, deleteRecipeById };
