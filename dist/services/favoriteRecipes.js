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
exports.removeFromFavoritesRecipe = exports.addToFavoritesRecipe = exports.getFavoritesRecipe = void 0;
const recipe_1 = __importDefault(require("../models/recipe"));
const getFavoritesRecipe = (userId, skip, limit) => __awaiter(void 0, void 0, void 0, function* () {
    const favoriteRecipes = yield recipe_1.default.find({ favorites: { $in: [userId] } })
        .skip(skip)
        .limit(limit);
    const totalFavoritesRecipes = yield recipe_1.default.countDocuments({
        favorites: { $in: [userId] },
    });
    return { favoriteRecipes, totalFavoritesRecipes };
});
exports.getFavoritesRecipe = getFavoritesRecipe;
const addToFavoritesRecipe = (userId, recipeId) => __awaiter(void 0, void 0, void 0, function* () {
    const recipe = yield recipe_1.default.findByIdAndUpdate(recipeId, { $addToSet: { favorites: userId } }, { new: true });
    return recipe;
});
exports.addToFavoritesRecipe = addToFavoritesRecipe;
const removeFromFavoritesRecipe = (userId, recipeId) => __awaiter(void 0, void 0, void 0, function* () {
    const recipe = yield recipe_1.default.findByIdAndUpdate(recipeId, { $pull: { favorites: userId } }, { new: true });
    return recipe;
});
exports.removeFromFavoritesRecipe = removeFromFavoritesRecipe;
