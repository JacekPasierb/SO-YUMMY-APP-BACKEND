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
exports.fetchRecipeById = exports.fetchRecipesByCategory = exports.fetchCategoriesList = exports.fetchRecipesByFourCategories = exports.fetchRecipes = void 0;
const category_1 = __importDefault(require("../models/category"));
const ingredient_1 = __importDefault(require("../models/ingredient"));
const recipe_1 = __importDefault(require("../models/recipe"));
const handleErrors_1 = __importDefault(require("../utils/handleErrors"));
const fetchRecipes = (query, ingredient, page, limit) => __awaiter(void 0, void 0, void 0, function* () {
    const filters = {};
    const skip = (page - 1) * limit;
    if (query) {
        filters.title = { $regex: query, $options: "i" };
    }
    else if (ingredient) {
        const ing = yield ingredient_1.default.findOne({
            ttl: { $regex: ingredient, $options: "i" },
        });
        if (!ing)
            throw (0, handleErrors_1.default)(404, "Ingredient not found");
        filters.ingredients = { $elemMatch: { id: ing._id } };
    }
    const result = yield recipe_1.default.find(filters).skip(skip).limit(limit);
    const totalRecipes = yield recipe_1.default.countDocuments(filters);
    return { result, totalRecipes };
});
exports.fetchRecipes = fetchRecipes;
const fetchRecipesByFourCategories = (count) => __awaiter(void 0, void 0, void 0, function* () {
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
        { $limit: count },
    ];
    const result = yield recipe_1.default.aggregate([
        {
            $facet: {
                breakfast: [{ $match: { category: "Breakfast" } }, ...options],
                miscellaneous: [{ $match: { category: "Miscellaneous" } }, ...options],
                chicken: [{ $match: { category: "Chicken" } }, ...options],
                dessert: [{ $match: { category: "Dessert" } }, ...options],
            },
        },
    ]);
    return result[0];
});
exports.fetchRecipesByFourCategories = fetchRecipesByFourCategories;
const fetchCategoriesList = () => __awaiter(void 0, void 0, void 0, function* () {
    const categories = yield category_1.default.find();
    const catArr = categories
        .map((cat) => cat.title)
        .sort((a, b) => a.localeCompare(b));
    return { catArr };
});
exports.fetchCategoriesList = fetchCategoriesList;
const fetchRecipesByCategory = (category, page, limit) => __awaiter(void 0, void 0, void 0, function* () {
    const skip = (page - 1) * limit;
    const result = yield recipe_1.default.find({ category }).skip(skip).limit(limit);
    const total = yield recipe_1.default.countDocuments({ category });
    if (result.length === 0)
        throw (0, handleErrors_1.default)(404, "No recipes found for this category");
    return { result, total };
});
exports.fetchRecipesByCategory = fetchRecipesByCategory;
const fetchRecipeById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield recipe_1.default.findById(id);
    if (!result)
        throw (0, handleErrors_1.default)(404, "Recipe not found");
    return { result };
});
exports.fetchRecipeById = fetchRecipeById;
