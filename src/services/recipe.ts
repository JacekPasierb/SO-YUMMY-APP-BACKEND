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

const categoryTranslations: Record<string, Record<string, string>> = {
  breakfast: { en: "Breakfast", pl: "Śniadanie" },
  miscellaneous: { en: "Miscellaneous", pl: "Różne" },
  chicken: { en: "Chicken", pl: "Kurczak" },
  dessert: { en: "Dessert", pl: "Desery" },
};

const sectionTranslations: Record<string, Record<string, string>> = {
  breakfast: { en: "breakfast", pl: "sniadanie" },
  miscellaneous: { en: "miscellaneous", pl: "rozne" },
  chicken: { en: "chicken", pl: "kurczak" },
  dessert: { en: "dessert", pl: "desery" },
};

const fetchRecipesByFourCategories = async (count: number, lang: string) => {
  const options = [
    {
      $project: {
        _id: 1,
        category: 1,
        preview: 1,
        thumb: 1,
        title: { $ifNull: [`$translations.${lang}.title`, "$title"] },
      },
    },
    { $limit: count },
  ];

  // Dynamiczne budowanie `$facet`
  const facetObject = Object.entries(categoryTranslations).reduce((acc, [key, translations]) => {
    const translatedCategory = translations[lang] || translations.en; // Domyślnie angielski
    const translatedSection = sectionTranslations[key][lang] || sectionTranslations[key].en; // Domyślna nazwa sekcji

    acc[translatedSection] = [{ $match: { category: translatedCategory } }, ...options];
    return acc;
  }, {} as Record<string, any[]>);

  return await Recipe.aggregate([{ $facet: facetObject }]);
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
