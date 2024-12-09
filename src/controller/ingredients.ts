import { Request, Response, NextFunction } from "express";
import Ingredient from "../models/ingredient";
import handleError from "../utils/handleErrors";

const getAllIngredients = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ingredients = await Ingredient.find();

    res.status(200).json({
      status: "success",
      code: 200,
      data: {
        ingredients,
      },
    });
  } catch (error) {
    next(handleError(500, (error as Error).message));
  }
};

const getIngredientById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const ingredient = await Ingredient.findById(id);

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
