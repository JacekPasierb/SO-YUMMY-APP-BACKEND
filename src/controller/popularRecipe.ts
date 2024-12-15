import { Request, Response, NextFunction } from "express";
import { fetchPopularRecipes } from "../services/popularRecipe";

const getPopularRecipes = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const count = Number(req.query.count) || 4;
    const popularRecipes = await fetchPopularRecipes(count);

    res.status(200).json({
      popularRecipes,
    });
  } catch (error) {
    next({
      status: 500,
      message: `Error while getting popular recipes: ${
        (error as Error).message
      }`,
    });
  }
};

export { getPopularRecipes };
