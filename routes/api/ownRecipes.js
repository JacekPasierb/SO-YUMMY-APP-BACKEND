const express = require("express");
const auth = require("../../middlewares/auth");
const validateBody = require("../../middlewares/validateBody");
const recipeSchema = require("../../schemas/recipeSchema");
const {
  addOwnRecipe,
  deleteOwnRecipe,
  getOwnRecipes,
} = require("../../controller/ownRecipeController");
const router = express.Router();

router.get("/", auth, getOwnRecipes);
router.post("/add", auth, validateBody(recipeSchema), addOwnRecipe);
router.delete("/remove/:recipeId", auth, deleteOwnRecipe);

module.exports = router;
