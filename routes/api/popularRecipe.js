const express = require("express");
const auth = require("../../middlewares/auth");
const { getPopularRecipes } = require("../../controller/popularRecipe");

const router = express.Router();

router.get("/", auth, getPopularRecipes);

module.exports = router;
