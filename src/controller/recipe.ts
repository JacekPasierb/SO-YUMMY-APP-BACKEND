import { Request, Response, NextFunction } from "express";
import Category from "../models/category";
import Ingredient from "../models/ingredient";
import Recipe from "../models/recipe";
import handleError from "../utils/handleErrors";

const getRecipes = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const filters: any = {};
    const { query, ingredient, page = 1, limit = 6 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    if (query) {
      filters.title = { $regex: query, $options: "i" };
    } else if (ingredient) {
      const ing = await Ingredient.findOne({
        ttl: { $regex: ingredient as string, $options: "i" },
      });
      if (!ing) {
        return next(handleError(404, "Ingredient not found"));
      }
      const ingID = ing._id;
      filters.ingredients = {
        $elemMatch: { id: ingID },
      };
    }

    const result = await Recipe.find(filters).skip(skip).limit(Number(limit));
    const totalRecipes = await Recipe.countDocuments(filters);

    res.status(200).json({
      status: "success",
      code: 200,
      data: {
        result,
        totalRecipes,
      },
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
    const options = [
      {
        $project: {
          _id: 1,
          title: 1,
          category: 1,
          preview: 1,
          thumb: 1,
        },
      },
      { $limit: Number(count) },
    ];

    const result = await Recipe.aggregate([
      {
        $facet: {
          breakfast: [{ $match: { category: "Breakfast" } }, ...options],
          miscellaneous: [
            { $match: { category: "Miscellaneous" } },
            ...options,
          ],
          chicken: [{ $match: { category: "Chicken" } }, ...options],
          dessert: [{ $match: { category: "Dessert" } }, ...options],
        },
      },
    ]);

    res.status(200).json({
      status: "success",
      code: 200,
      data: {
        ...result[0],
      },
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
    const categories = await Category.find();
    const catArr = categories
      .map((cat) => cat.title)
      .sort((a, b) => a.localeCompare(b));

    res.status(200).json({
      status: "success",
      code: 200,
      data: {
        catArr,
      },
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
    let { page = 1, limit = 8 } = req.query;
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const result = await Recipe.find({ category })
      .skip(skip)
      .limit(limitNumber);
    const total = await Recipe.countDocuments({ category });

    if (result.length === 0) {
      return next(handleError(404, "No recipes found for this category"));
    }

    res.status(200).json({
      status: "success",
      code: 200,
      data: {
        result,
        total,
      },
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
    const result = await Recipe.findById(id);

    if (!result) {
      return next(handleError(404, "Recipe not found"));
    }

    res.status(200).json({
      status: "success",
      code: 200,
      data: {
        result,
      },
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
