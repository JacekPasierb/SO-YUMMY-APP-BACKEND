"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const favoriteRecipes_1 = require("../../controller/favoriteRecipes");
const router = express_1.default.Router();
router.get("/", auth_1.default, favoriteRecipes_1.getFavorites);
router.patch("/add/:recipeId", auth_1.default, favoriteRecipes_1.addToFavorites);
router.delete("/remove/:recipeId", auth_1.default, favoriteRecipes_1.removeFromFavorite);
exports.default = router;
