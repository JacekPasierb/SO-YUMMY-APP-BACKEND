import { Request, Response, NextFunction } from "express";
import handleError from "../utils/handleErrors";
import {
  fetchAllIngredients,
  fetchIngredientById,
} from "../services/ingredients";

const getAllIngredients = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ingredients = await fetchAllIngredients();

    res.status(200).json({
      status: "success",
      code: 200,
      data: {
        ingredients,
      },
    });
  } catch (error) {
    next(handleError(500,`Error fetching ingredients`));
  }
};

const getIngredientById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const ingredient = await fetchIngredientById(id);

    if (!ingredient) {
      return next(handleError(404, "Ingredient not found"));
    }

    res.status(200).json({
      status: "success",
      code: 200,
      data: {
        ingredient,
      },
    });
  } catch (error) {
    next(handleError(500, (error as Error).message));
  }
};

export { getAllIngredients, getIngredientById };
