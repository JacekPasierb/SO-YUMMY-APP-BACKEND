import express from "express";
import auth from "../../middlewares/auth";
import { addToFavorites, removeFromFavorite, getFavorites } from "../../controller/favoriteRecipes";

const router = express.Router();

router.get("/", auth, getFavorites);
router.patch("/add/:recipeId", auth, addToFavorites);
router.delete("/remove/:recipeId", auth, removeFromFavorite);

export default router; 