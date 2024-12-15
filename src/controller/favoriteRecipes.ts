import { Request, Response, NextFunction } from "express";
import handleError from "../utils/handleErrors";
import { IUser } from "../models/user";
import {
  addToFavoritesRecipe,
  getFavoritesRecipe,
  removeFromFavoritesRecipe,
} from "../services/favoriteRecipes";

const getFavorites = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req.user as IUser)._id;

    let { page = 1, limit = 4 } = req.query;
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const { favoriteRecipes, totalFavoritesRecipes } = await getFavoritesRecipe(
      userId,
      skip,
      limitNumber
    );

    res.status(200).json({
      status: "success",
      code: 200,
      data: {
        favoriteRecipes,
        totalFavoritesRecipes,
      },
    });
  } catch (error) {
    next(handleError(500, (error as Error).message));
  }
};

const addToFavorites = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { recipeId } = req.params;
    const userId = (req.user as IUser)._id;

    const recipe = await addToFavoritesRecipe(userId, recipeId);

    if (!recipe) {
      return next(handleError(404, "Recipe not found"));
    }

    res.status(200).json({
      status: "success",
      code: 200,
      data: {
        recipe,
      },
    });
  } catch (error) {
    next(handleError(500, (error as Error).message));
  }
};

const removeFromFavorite = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { recipeId } = req.params;
    const userId = (req.user as IUser)._id;

    const recipe = await removeFromFavoritesRecipe(userId, recipeId);

    if (!recipe) {
      return next(handleError(404, "Recipe not found"));
    }

    res.status(200).json({ message: "Removed from favorites successfully" });
  } catch (error) {
    next(handleError(500, (error as Error).message));
  }
};

export { addToFavorites, removeFromFavorite, getFavorites };
