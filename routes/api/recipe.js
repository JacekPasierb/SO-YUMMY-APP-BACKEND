const express = require("express");
const auth = require("../../middlewares/auth");
const {
  getRecipesByFourCategories, getCategoriesList, getRecipesByCategory, getRecipeById, addRecipe,
} = require("../../controller/recipeController");
const router = express.Router();

router.get("/", auth, getRecipesByFourCategories);
router.get("/category-list", auth, getCategoriesList);
router.get("/categories/:category", auth, getRecipesByCategory);
router.get("/:id", auth, getRecipeById);
router.post("/add", auth, addRecipe)

module.exports = router;
 