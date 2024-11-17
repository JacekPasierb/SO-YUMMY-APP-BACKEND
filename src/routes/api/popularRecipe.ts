import express from "express";
import auth from "../../middlewares/auth";
import { getPopularRecipes } from "../../controller/popularRecipe";

const router = express.Router();

router.get("/", auth, getPopularRecipes);

export default router; 