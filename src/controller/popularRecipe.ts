import { Request, Response, NextFunction } from "express";
import Recipe from "../models/recipe";

const getPopularRecipes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const count = Number(req.query.count) || 4;
    const popularRecipes = await Recipe.aggregate([
      { $match: { "favorites.0": { $exists: true } } },
      { $sort: { "favorites.length": -1 } },
      { $limit: count },
    ]);

    res.status(200).json({
      popularRecipes,
    });
  } catch (error) {
    next({
      status: 500,
      message: `Error while getting popular recipes: ${(error as Error).message}`,
    });
  }
};

export {
  getPopularRecipes,
}; 