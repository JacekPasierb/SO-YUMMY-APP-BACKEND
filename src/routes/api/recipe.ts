import express from "express";
import auth from "../../middlewares/auth";
import {
  getRecipesByFourCategories,
  getCategoriesList,
  getCategoriesListPl,
  getRecipesByCategory,
  getRecipeById,
  getRecipes,
} from "../../controller/recipe";

const router = express.Router();

router.get("/", auth, getRecipes);
router.get("/main-page", auth, getRecipesByFourCategories);
router.get("/category-list", auth, getCategoriesList);
router.get("/category-listPl", auth, getCategoriesListPl);
router.get("/categories/:category", auth, getRecipesByCategory);
router.get("/:id", auth, getRecipeById);

export default router;
