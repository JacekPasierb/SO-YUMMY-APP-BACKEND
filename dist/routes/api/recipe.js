"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const recipe_1 = require("../../controller/recipe");
const router = express_1.default.Router();
router.get("/", auth_1.default, recipe_1.getRecipes);
router.get("/main-page", auth_1.default, recipe_1.getRecipesByFourCategories);
router.get("/category-list", auth_1.default, recipe_1.getCategoriesList);
router.get("/category-listPl", auth_1.default, recipe_1.getCategoriesListPl);
router.get("/categories/:category", auth_1.default, recipe_1.getRecipesByCategory);
router.get("/:id", auth_1.default, recipe_1.getRecipeById);
exports.default = router;
