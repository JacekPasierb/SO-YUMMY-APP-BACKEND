import { Types } from "mongoose";
import Recipe from "../models/recipe";

const getFavoritesRecipe = async (
  userId: Types.ObjectId,
  skip: number,
  limit: number
) => {
  const favoriteRecipes = await Recipe.find({ favorites: { $in: [userId] } })
    .skip(skip)
    .limit(limit);

  const totalFavoritesRecipes = await Recipe.countDocuments({
    favorites: { $in: [userId] },
  });

  return { favoriteRecipes, totalFavoritesRecipes };
};

const addToFavoritesRecipe = async (
  userId: Types.ObjectId,
  recipeId: string
) => {
  return await Recipe.findByIdAndUpdate(
    recipeId,
    { $addToSet: { favorites: userId } },
    { new: true }
  );
};

const removeFromFavoritesRecipe = async (
  userId: Types.ObjectId,
  recipeId: string
) => {
  return await Recipe.findByIdAndUpdate(
    recipeId,
    { $pull: { favorites: userId } },
    { new: true }
  );
};

export { getFavoritesRecipe, addToFavoritesRecipe, removeFromFavoritesRecipe };
