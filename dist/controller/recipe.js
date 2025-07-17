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
exports.getRecipeById = exports.getRecipesByCategory = exports.getCategoriesListPl = exports.getCategoriesList = exports.getRecipesByFourCategories = exports.getRecipes = void 0;
const handleErrors_1 = __importDefault(require("../utils/handleErrors"));
const ingredients_1 = require("../services/ingredients");
const recipe_1 = require("../services/recipe");
const getRecipes = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { query, ingredient, page = 1, limit = 6 } = req.query;
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        const filters = {};
        if (query) {
            filters.title = { $regex: query, $options: "i" };
        }
        else if (ingredient) {
            const ing = yield (0, ingredients_1.fetchIngredientByName)(ingredient);
            if (!ing) {
                return next((0, handleErrors_1.default)(404, "Ingredient not found"));
            }
            filters.ingredients = {
                $elemMatch: { id: ing._id },
            };
        }
        const { result, totalRecipes } = yield (0, recipe_1.fetchRecipes)(filters, pageNumber, limitNumber);
        res.status(200).json({
            status: "success",
            code: 200,
            data: {
                result,
                totalRecipes,
            },
        });
    }
    catch (error) {
        next((0, handleErrors_1.default)(500, error.message));
    }
});
exports.getRecipes = getRecipes;
const getRecipesByFourCategories = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { count = 1, lang = "pl" } = req.query;
        console.log("BACKEND check count: ", count);
        const result = yield (0, recipe_1.fetchRecipesByFourCategories)(Number(count), lang);
        console.log("Wyniki", result[0]);
        res.status(200).json({
            status: "success",
            code: 200,
            data: Object.assign({}, result[0]),
        });
    }
    catch (error) {
        next((0, handleErrors_1.default)(500, error.message));
    }
});
exports.getRecipesByFourCategories = getRecipesByFourCategories;
const getCategoriesList = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { catArr } = yield (0, recipe_1.fetchCategoriesList)();
        res.status(200).json({
            status: "success",
            code: 200,
            data: {
                catArr,
            },
        });
    }
    catch (error) {
        next((0, handleErrors_1.default)(500, error.message));
    }
});
exports.getCategoriesList = getCategoriesList;
const getCategoriesListPl = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { catArr } = yield (0, recipe_1.fetchCategoriesListPl)();
        res.status(200).json({
            status: "success",
            code: 200,
            data: {
                catArr,
            },
        });
    }
    catch (error) {
        next((0, handleErrors_1.default)(500, error.message));
    }
});
exports.getCategoriesListPl = getCategoriesListPl;
const getRecipesByCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { category } = req.params;
        let { page = 1, limit = 8 } = req.query;
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        const skip = (pageNumber - 1) * limitNumber;
        const { result, total } = yield (0, recipe_1.fetchRecipesByCategory)(category, pageNumber, limitNumber);
        if (result.length === 0) {
            return next((0, handleErrors_1.default)(404, "No recipes found for this category"));
        }
        res.status(200).json({
            status: "success",
            code: 200,
            data: {
                result,
                total,
            },
        });
    }
    catch (error) {
        next((0, handleErrors_1.default)(500, error.message));
    }
});
exports.getRecipesByCategory = getRecipesByCategory;
const getRecipeById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const result = yield (0, recipe_1.fetchRecipeById)(id);
        if (!result) {
            return next((0, handleErrors_1.default)(404, "Recipe not found"));
        }
        res.status(200).json({
            status: "success",
            code: 200,
            data: {
                result,
            },
        });
    }
    catch (error) {
        next((0, handleErrors_1.default)(500, error.message));
    }
});
exports.getRecipeById = getRecipeById;
