const express = require("express");
const auth = require("../../middlewares/auth");
const { getAllIngredients } = require("../../controller/ingredientsController");

const router = express.Router();

router.get("/", auth, getAllIngredients);


module.exports = router;
 