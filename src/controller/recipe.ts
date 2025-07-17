import {Request, Response, NextFunction} from "express";
import handleError from "../utils/handleErrors";
import {fetchIngredientByName} from "../services/ingredients";
import {
  fetchCategoriesList,
fetchCategoriesListPl,
  fetchRecipeById,
  fetchRecipes,
  fetchRecipesByCategory,
  fetchRecipesByFourCategories,
} from "../services/recipe";

const getRecipes = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {query, ingredient, page = 1, limit = 6} = req.query;
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);

    const filters: any = {};

    if (query) {
      filters.title = {$regex: query, $options: "i"};
    } else if (ingredient) {
      const ing = await fetchIngredientByName(ingredient as string);

      if (!ing) {
        return next(handleError(404, "Ingredient not found"));
      }

      filters.ingredients = {
        $elemMatch: {id: ing._id},
      };
    }

    const {result, totalRecipes} = await fetchRecipes(
      filters,
      pageNumber,
      limitNumber
    );

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
    const {count = 1, lang="pl" } = req.query;
console.log("BACKEND check count: ",count);

    const result = await fetchRecipesByFourCategories(Number(count), lang as string);
console.log("Wyniki",result[0]);

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
    const {catArr} = await fetchCategoriesList();

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

const getCategoriesListPl = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {catArr} = await fetchCategoriesListPl();

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
    const {category} = req.params;
    let {page = 1, limit = 8} = req.query;
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const {result, total} = await fetchRecipesByCategory(
      category,
      pageNumber,
      limitNumber
    );

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
    const {id} = req.params;
    const result = await fetchRecipeById(id);

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
getCategoriesListPl,
  getRecipesByCategory,
  getRecipeById,
};
