import { Request, Response, NextFunction } from "express";
import Recipe from "../models/recipe";
import handleError from "../utils/handleErrors";

const getOwnRecipes = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return next(handleError(401, "Unauthorized"));
    }

    let { page = 1, limit = 4 } = req.query;
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const totalOwnRecipes = await Recipe.countDocuments({ owner: userId });
    const totalPages = Math.ceil(totalOwnRecipes / limitNumber);

    if (pageNumber > totalPages) {
      res.status(200).json({
        status: "success",
        code: 200,
        data: {
          ownRecipes: [],
          totalOwnRecipes,
        },
        message: "Page number exceeds total number of available pages.",
      });
      return;
    }

    const ownRecipes = await Recipe.find({ owner: userId })
      .skip(skip)
      .limit(limitNumber);

    if (ownRecipes.length === 0) {
      return next(handleError(404, "Not found own recipes"));
    }

    res.status(200).json({
      status: "success",
      code: 200,
      data: {
        ownRecipes,
        totalOwnRecipes,
      },
    });
  } catch (error) {
    next(handleError(500, (error as Error).message));
  }
};

const addOwnRecipe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return next(handleError(401, "Unauthorized"));
    }

    const newRecipe = await Recipe.create({
      ...req.body,
      owner: userId,
    });

    res.status(200).json({
      status: "success",
      code: 200,
      data: {
        newRecipe,
      },
    });
  } catch (error) {
    next(handleError(500, (error as Error).message));
  }
};

const deleteOwnRecipe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { recipeId } = req.params;
    const result = await Recipe.findByIdAndDelete(recipeId);
    if (!result) {
      return next(handleError(404, "Recipe not found..."));
    }
    res.status(200).json({
      status: "success",
      code: 200,
      message: "Recipe deleted",
    });
  } catch (error) {
    next(handleError(500, (error as Error).message));
  }
};

export { getOwnRecipes, addOwnRecipe, deleteOwnRecipe };
