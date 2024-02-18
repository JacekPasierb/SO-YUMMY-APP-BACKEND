const express = require("express");
const auth = require("../../middlewares/auth");
const {
  getRecipesByFourCategories,
} = require("../../controller/recipeController");
const router = express.Router();

router.get("/", auth, getRecipesByFourCategories);

module.exports = router;