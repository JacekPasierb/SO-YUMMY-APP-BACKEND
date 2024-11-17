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
const category_1 = __importDefault(require("../models/category"));
const ingredient_1 = __importDefault(require("../models/ingredient"));
const recipe_1 = __importDefault(require("../models/recipe"));
const handleErrors_1 = __importDefault(require("../utils/handleErrors"));
const getRecipes = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const filters = {};
        const { query, ingredient, page = 1, limit = 6 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        if (query) {
            filters.title = { $regex: query, $options: "i" };
        }
        else if (ingredient) {
            const ing = yield ingredient_1.default.findOne({
                ttl: { $regex: ingredient, $options: "i" },
            });
            if (!ing) {
                return next((0, handleErrors_1.default)(404, "Ingredient not found"));
            }
            const ingID = ing._id;
            filters.ingredients = {
                $elemMatch: { id: ingID },
            };
        }
        const result = yield recipe_1.default.find(filters).skip(skip).limit(Number(limit));
        const totalRecipes = yield recipe_1.default.countDocuments(filters);
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
        const { count = 1 } = req.query;
        const options = [
            {
                $project: {
                    _id: 1,
                    title: 1,
                    category: 1,
                    preview: 1,
                    thumb: 1,
                },
            },
            { $limit: Number(count) },
        ];
        const result = yield recipe_1.default.aggregate([
            {
                $facet: {
                    breakfast: [{ $match: { category: "Breakfast" } }, ...options],
                    miscellaneous: [
                        { $match: { category: "Miscellaneous" } },
                        ...options,
                    ],
                    chicken: [{ $match: { category: "Chicken" } }, ...options],
                    dessert: [{ $match: { category: "Dessert" } }, ...options],
                },
            },
        ]);
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
        const categories = yield category_1.default.find();
        const catArr = categories
            .map((cat) => cat.title)
            .sort((a, b) => a.localeCompare(b));
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
const getRecipesByCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { category } = req.params;
        let { page = 1, limit = 8 } = req.query;
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        const skip = (pageNumber - 1) * limitNumber;
        const result = yield recipe_1.default.find({ category })
            .skip(skip)
            .limit(limitNumber);
        const total = yield recipe_1.default.countDocuments({ category });
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
        const result = yield recipe_1.default.findById(id);
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
