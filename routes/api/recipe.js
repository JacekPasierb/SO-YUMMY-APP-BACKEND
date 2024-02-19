const express = require("express");
const auth = require("../../middlewares/auth");
const {
  getRecipesByFourCategories, getCategoriesList, getRecipesByCategory, getRecipeById,
} = require("../../controller/recipeController");
const router = express.Router();

router.get("/", auth, getRecipesByFourCategories);
router.get("/category-list", auth, getCategoriesList);
router.get("/categories/:category", auth, getRecipesByCategory);
router.get("/:id", auth, getRecipeById);

module.exports = router;
