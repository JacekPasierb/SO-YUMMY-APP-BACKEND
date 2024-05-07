const express = require("express");
const auth = require("../../middlewares/auth");
const {
  getRecipesByFourCategories,
  getCategoriesList,
  getRecipesByCategory,
  getRecipeById,
  addRecipe,
} = require("../../controller/recipeController");
const validateBody = require("../../middlewares/validateBody");
const recipeSchema = require("../../schemas/recipeSchema");
const router = express.Router();

router.get("/main-page", auth, getRecipesByFourCategories);
router.get("/category-list", auth, getCategoriesList);
router.get("/categories/:category", auth, getRecipesByCategory);
router.get("/:id", auth, getRecipeById);


module.exports = router;
