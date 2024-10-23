const express = require("express");
const auth = require("../../middlewares/auth");
const { deleteIngredient, addIngredient, getShoppingList } = require("../../controller/shoppingListController");

const router = express.Router();

router.get("/", auth, getShoppingList);
router.post("/add", auth, addIngredient);
router.delete("/remove", auth, deleteIngredient);

module.exports = router;
