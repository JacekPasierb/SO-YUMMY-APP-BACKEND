import express from "express";
import auth from "../../middlewares/auth";
import {
  deleteIngredient,
  addIngredient,
  getShoppingList,
} from "../../controller/shoppingList";

const router = express.Router();

router.get("/", auth, getShoppingList);
router.post("/add", auth, addIngredient);
router.delete("/remove", auth, deleteIngredient);

export default router;
