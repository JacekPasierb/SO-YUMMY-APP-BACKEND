import Category from "../models/category";
import Ingredient from "../models/ingredient";
import Recipe from "../models/recipe";
import handleError from "../utils/handleErrors";

const fetchRecipes = async (
  query: string,
  ingredient: string,
  page: number,
  limit: number
) => {
  const filters: any = {};
  const skip = (page - 1) * limit;

  if (query) {
    filters.title = { $regex: query, $options: "i" };
  } else if (ingredient) {
    const ing = await Ingredient.findOne({
      ttl: { $regex: ingredient, $options: "i" },
    });
    if (!ing) throw handleError(404, "Ingredient not found");

    filters.ingredients = { $elemMatch: { id: ing._id } };
  }

  const result = await Recipe.find(filters).skip(skip).limit(limit);
  const totalRecipes = await Recipe.countDocuments(filters);

  return { result, totalRecipes };
};

const fetchRecipesByFourCategories = async (count: number) => {
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
    { $limit: count },
  ];

  const result = await Recipe.aggregate([
    {
      $facet: {
        breakfast: [{ $match: { category: "Breakfast" } }, ...options],
        miscellaneous: [{ $match: { category: "Miscellaneous" } }, ...options],
        chicken: [{ $match: { category: "Chicken" } }, ...options],
        dessert: [{ $match: { category: "Dessert" } }, ...options],
      },
    },
  ]);

  return result[0];
};

const fetchCategoriesList = async () => {
  const categories = await Category.find();
  const catArr = categories
    .map((cat) => cat.title)
    .sort((a, b) => a.localeCompare(b));
  return { catArr };
};

const fetchRecipesByCategory = async (
  category: string,
  page: number,
  limit: number
) => {
  const skip = (page - 1) * limit;

  const result = await Recipe.find({ category }).skip(skip).limit(limit);
  const total = await Recipe.countDocuments({ category });

  if (result.length === 0)
    throw handleError(404, "No recipes found for this category");

  return { result, total };
};

const fetchRecipeById = async (id: string) => {
  const result = await Recipe.findById(id);
  if (!result) throw handleError(404, "Recipe not found");

  return { result };
};

export {
  fetchRecipes,
  fetchRecipesByFourCategories,
  fetchCategoriesList,
  fetchRecipesByCategory,
  fetchRecipeById,
};
