import express from "express";
import auth from "../../middlewares/auth";
import validateBody from "../../middlewares/validateBody";
import recipeSchema from "../../schemas/recipe";
import { addOwnRecipe, deleteOwnRecipe, getOwnRecipes } from "../../controller/ownRecipe";
import { saveImages } from "../../controller/cloudinary/index";
import upload from "../../middlewares/multer";

const router = express.Router();

router.get("/:userId", auth, getOwnRecipes);
router.post("/add", auth, validateBody(recipeSchema), addOwnRecipe);
router.delete("/remove/:recipeId", auth, deleteOwnRecipe);
router.post("/picture", auth, upload.single("file"), saveImages);

export default router; 