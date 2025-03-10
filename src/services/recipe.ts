import Category from "../models/category";
import CategoryPl from "../models/categoryPl";

import Ingredient from "../models/ingredient";
import Recipe from "../models/recipe";
import handleError from "../utils/handleErrors";

const fetchRecipes = async (
  filters: Object,
  pageNumber: number,
  limitNumber: number
) => {
  const skip = (pageNumber - 1) * limitNumber;
  const result = await Recipe.find(filters).skip(skip).limit(limitNumber);
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

  return await Recipe.aggregate([
    {
      $facet: {
        breakfast: [{ $match: { category: "Breakfast" } }, ...options],
        miscellaneous: [{ $match: { category: "Miscellaneous" } }, ...options],
        chicken: [{ $match: { category: "Chicken" } }, ...options],
        dessert: [{ $match: { category: "Dessert" } }, ...options],
      },
    },
  ]);
};

const fetchCategoriesList = async () => {
  const categories = await Category.find();
  const catArr = categories
    .map((cat) => cat.title)
    .sort((a, b) => a.localeCompare(b));
  return { catArr };
};

const fetchCategoriesListPl = async () => {
  console.log("🛠️ Pobieranie kategorii PL...");
  const categories = await CategoryPl.find();
  console.log("📌 Kategorie zwrócone przez MongoDB:", categories);
  if (!categories.length) {
    console.log("❌ MongoDB zwróciło pustą tablicę!");
  }
  
  const catArr = categories
    .map((cat) => cat.title)
    .sort((a, b) => a.localeCompare(b));
    console.log("✅ Kategorie po mapowaniu:", catArr);
  return { catArr };
};

const fetchRecipesByCategory = async (
  category: string,
  pageNumber: number,
  limitNumber: number
) => {
  const skip = (pageNumber - 1) * limitNumber;

  const result = await Recipe.find({ category }).skip(skip).limit(limitNumber);
  const total = await Recipe.countDocuments({ category });

  return { result, total };
};

const fetchRecipeById = async (id: string) => {
  return await Recipe.findById(id);
};

export {
  fetchRecipes,
  fetchRecipesByFourCategories,
  fetchCategoriesList,
  fetchCategoriesListPl,

  fetchRecipesByCategory,
  fetchRecipeById,
};
