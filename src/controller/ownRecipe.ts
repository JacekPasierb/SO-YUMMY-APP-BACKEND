import { Request, Response, NextFunction } from "express";
import Recipe from "../models/recipe";
import handleError from "../utils/handleErrors";
import { IUser } from "../models/user";
import {
  createRecipe,
  deleteRecipeById,
  fetchOwnRecipes,
} from "../services/ownRecipe";

const getOwnRecipes = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req.user as IUser)._id;

    let { page = 1, limit = 4 } = req.query;
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);

    if (
      isNaN(pageNumber) ||
      isNaN(limitNumber) ||
      pageNumber < 1 ||
      limitNumber < 1
    ) {
      return next(handleError(400, "Invalid pagination parameters"));
    }

    const { recipes: ownRecipes, totalOwnRecipes } = await fetchOwnRecipes(
      userId,
      pageNumber,
      limitNumber
    );

    if (totalOwnRecipes === 0) {
      return next(handleError(404, "Not found own recipes"));
    }

    const totalPages = Math.ceil(totalOwnRecipes / limitNumber);

    if (pageNumber > totalPages) {
      return next(
        handleError(404, "Page number exceeds total number of available pages")
      );
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
    const userId = (req.user as IUser)._id;

    const newRecipe = await createRecipe({
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
    const result = await deleteRecipeById(recipeId);

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
