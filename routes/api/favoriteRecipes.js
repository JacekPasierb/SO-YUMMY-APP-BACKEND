const express = require("express");
const auth = require("../../middlewares/auth");
const { addToFavorites, removeFromFavorite, getFavorites } = require("../../controller/favoriteRecipes");

const router = express.Router();

router.get("/", auth, getFavorites);
router.patch("/add/:recipeId", auth, addToFavorites);
router.delete("/remove/:recipeId", auth, removeFromFavorite);
module.exports = router;
