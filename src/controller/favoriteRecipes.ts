import { Request, Response, NextFunction } from "express";
import Recipe from "../models/recipe";
import handleError from "../utils/handleErrors";

const getFavorites = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(handleError(401, "Unauthorized"));
    }

    let { page = 1, limit = 4 } = req.query;
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const favoriteRecipes = await Recipe.find({ favorites: { $in: [userId] } })
      .skip(skip)
      .limit(limitNumber);

    const totalFavoritesRecipes = await Recipe.countDocuments({
      favorites: { $in: [userId] },
    });

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

const addToFavorites = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { recipeId } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      return next(handleError(401, "Unauthorized"));
    }

    const recipe = await Recipe.findByIdAndUpdate(
      recipeId,
      { $addToSet: { favorites: userId } },
      { new: true }
    );

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

const removeFromFavorite = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { recipeId } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      return next(handleError(401, "Unauthorized"));
    }

    const recipe = await Recipe.findByIdAndUpdate(
      recipeId,
      { $pull: { favorites: userId } },
      { new: true }
    );

    if (!recipe) {
      return next(handleError(404, "Recipe not found"));
    }

    res.status(200).json({ message: "Removed from favorites successfully" });
  } catch (error) {
    next(handleError(500, (error as Error).message));
  }
};

export {
  addToFavorites,
  removeFromFavorite,
  getFavorites,
}; 