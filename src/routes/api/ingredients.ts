import express from "express";
import auth from "../../middlewares/auth";
import { getAllIngredients, getIngredientById } from "../../controller/ingredients";

const router = express.Router();

router.get("/", auth, getAllIngredients);
router.get("/:id", auth, getIngredientById);

export default router; 