"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFavorites = exports.removeFromFavorite = exports.addToFavorites = void 0;
const handleErrors_1 = __importDefault(require("../utils/handleErrors"));
const favoriteRecipes_1 = require("../services/favoriteRecipes");
const getFavorites = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user._id;
        let { page = 1, limit = 4 } = req.query;
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        const skip = (pageNumber - 1) * limitNumber;
        const { favoriteRecipes, totalFavoritesRecipes } = yield (0, favoriteRecipes_1.getFavoritesRecipe)(userId, skip, limitNumber);
        res.status(200).json({
            status: "success",
            code: 200,
            data: {
                favoriteRecipes,
                totalFavoritesRecipes,
            },
        });
    }
    catch (error) {
        next((0, handleErrors_1.default)(500, error.message));
    }
});
exports.getFavorites = getFavorites;
const addToFavorites = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { recipeId } = req.params;
        const userId = req.user._id;
        const recipe = yield (0, favoriteRecipes_1.addToFavoritesRecipe)(userId, recipeId);
        if (!recipe) {
            return next((0, handleErrors_1.default)(404, "Recipe not found"));
        }
        res.status(200).json({
            status: "success",
            code: 200,
            data: {
                recipe,
            },
        });
    }
    catch (error) {
        next((0, handleErrors_1.default)(500, error.message));
    }
});
exports.addToFavorites = addToFavorites;
const removeFromFavorite = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { recipeId } = req.params;
        const userId = req.user._id;
        const recipe = yield (0, favoriteRecipes_1.removeFromFavoritesRecipe)(userId, recipeId);
        if (!recipe) {
            return next((0, handleErrors_1.default)(404, "Recipe not found"));
        }
        res.status(200).json({ message: "Removed from favorites successfully" });
    }
    catch (error) {
        next((0, handleErrors_1.default)(500, error.message));
    }
});
exports.removeFromFavorite = removeFromFavorite;
