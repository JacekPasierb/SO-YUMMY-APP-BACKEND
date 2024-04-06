const express = require("express");
const auth = require("../../middlewares/auth");
const validateBody = require("../../middlewares/validateBody");
const recipeSchema = require("../../schemas/recipeSchema");
const {
  addOwnRecipe,
  deleteOwnRecipe,
  getOwnRecipes,
} = require("../../controller/ownRecipeController");
const router = express.Router();
const upload = require("../../middlewares/multer");
const { saveImages } = require("../../controller/cloudinary");


router.get("/", auth, getOwnRecipes);
router.post("/add", auth, validateBody(recipeSchema), addOwnRecipe);
router.delete("/remove/:recipeId", auth, deleteOwnRecipe);
// router.post("/picture", auth, upload.single("file"), saveImage);
router.post("/picture",auth, upload.single(file), saveImages);
module.exports = router;
