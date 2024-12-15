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
exports.getRecipeById = exports.getRecipesByCategory = exports.getCategoriesList = exports.getRecipesByFourCategories = exports.getRecipes = void 0;
const recipe_1 = require("../services/recipe");
const handleErrors_1 = __importDefault(require("../utils/handleErrors"));
const getRecipes = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { query, ingredient, page = 1, limit = 6 } = req.query;
        const result = yield (0, recipe_1.fetchRecipes)(query, ingredient, Number(page), Number(limit));
        res.status(200).json({
            status: "success",
            code: 200,
            data: result,
        });
    }
    catch (error) {
        next((0, handleErrors_1.default)(500, error.message));
    }
});
exports.getRecipes = getRecipes;
const getRecipesByFourCategories = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { count = 1 } = req.query;
        const result = yield (0, recipe_1.fetchRecipesByFourCategories)(Number(count));
        res.status(200).json({
            status: "success",
            code: 200,
            data: result,
        });
    }
    catch (error) {
        next((0, handleErrors_1.default)(500, error.message));
    }
});
exports.getRecipesByFourCategories = getRecipesByFourCategories;
const getCategoriesList = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, recipe_1.fetchCategoriesList)();
        res.status(200).json({
            status: "success",
            code: 200,
            data: result,
        });
    }
    catch (error) {
        next((0, handleErrors_1.default)(500, error.message));
    }
});
exports.getCategoriesList = getCategoriesList;
const getRecipesByCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { category } = req.params;
        const { page = 1, limit = 8 } = req.query;
        const result = yield (0, recipe_1.fetchRecipesByCategory)(category, Number(page), Number(limit));
        res.status(200).json({
            status: "success",
            code: 200,
            data: result,
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
        res.status(200).json({
            status: "success",
            code: 200,
            data: result,
        });
    }
    catch (error) {
        next((0, handleErrors_1.default)(500, error.message));
    }
});
exports.getRecipeById = getRecipeById;
