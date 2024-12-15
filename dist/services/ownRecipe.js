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
exports.deleteRecipeById = exports.createRecipe = exports.fetchOwnRecipes = void 0;
const recipe_1 = __importDefault(require("../models/recipe"));
const fetchOwnRecipes = (userId, page, limit) => __awaiter(void 0, void 0, void 0, function* () {
    const skip = (page - 1) * limit;
    const totalOwnRecipes = yield recipe_1.default.countDocuments({ owner: userId });
    const recipes = yield recipe_1.default.find({ owner: userId }).skip(skip).limit(limit);
    return { recipes, totalOwnRecipes };
});
exports.fetchOwnRecipes = fetchOwnRecipes;
const createRecipe = (recipeData) => __awaiter(void 0, void 0, void 0, function* () {
    return yield recipe_1.default.create(recipeData);
});
exports.createRecipe = createRecipe;
const deleteRecipeById = (recipeId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield recipe_1.default.findByIdAndDelete(recipeId);
});
exports.deleteRecipeById = deleteRecipeById;
