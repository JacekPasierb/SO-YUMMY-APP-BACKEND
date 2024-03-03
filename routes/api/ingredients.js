const express = require("express");
const auth = require("../../middlewares/auth");
const { getAllIngredients, getIngredientById } = require("../../controller/ingredientsController");

const router = express.Router();

router.get("/", auth, getAllIngredients);
router.get("/:id", auth, getIngredientById);


module.exports = router;
 