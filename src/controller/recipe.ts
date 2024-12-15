import { Request, Response, NextFunction } from "express";
import {
  fetchRecipes,
  fetchRecipesByFourCategories,
  fetchCategoriesList,
  fetchRecipesByCategory,
  fetchRecipeById,
} from "../services/recipe";
import handleError from "../utils/handleErrors";

const getRecipes = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { query, ingredient, page = 1, limit = 6 } = req.query;
    const result = await fetchRecipes(
      query as string,
      ingredient as string,
      Number(page),
      Number(limit)
    );

    res.status(200).json({
      status: "success",
      code: 200,
      data: result,
    });
  } catch (error) {
    next(handleError(500, (error as Error).message));
  }
};

const getRecipesByFourCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { count = 1 } = req.query;
    const result = await fetchRecipesByFourCategories(Number(count));

    res.status(200).json({
      status: "success",
      code: 200,
      data: result,
    });
  } catch (error) {
    next(handleError(500, (error as Error).message));
  }
};

const getCategoriesList = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await fetchCategoriesList();

    res.status(200).json({
      status: "success",
      code: 200,
      data: result,
    });
  } catch (error) {
    next(handleError(500, (error as Error).message));
  }
};

const getRecipesByCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 8 } = req.query;
    const result = await fetchRecipesByCategory(
      category,
      Number(page),
      Number(limit)
    );

    res.status(200).json({
      status: "success",
      code: 200,
      data: result,
    });
  } catch (error) {
    next(handleError(500, (error as Error).message));
  }
};

const getRecipeById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await fetchRecipeById(id);

    res.status(200).json({
      status: "success",
      code: 200,
      data: result,
    });
  } catch (error) {
    next(handleError(500, (error as Error).message));
  }
};

export {
  getRecipes,
  getRecipesByFourCategories,
  getCategoriesList,
  getRecipesByCategory,
  getRecipeById,
};
