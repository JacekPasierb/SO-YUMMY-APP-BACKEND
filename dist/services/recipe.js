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
exports.fetchRecipeById = exports.fetchRecipesByCategory = exports.fetchCategoriesListPl = exports.fetchCategoriesList = exports.fetchRecipesByFourCategories = exports.fetchRecipes = void 0;
const category_1 = __importDefault(require("../models/category"));
const categoryPl_1 = __importDefault(require("../models/categoryPl"));
const recipe_1 = __importDefault(require("../models/recipe"));
const fetchRecipes = (filters, pageNumber, limitNumber) => __awaiter(void 0, void 0, void 0, function* () {
    const skip = (pageNumber - 1) * limitNumber;
    const result = yield recipe_1.default.find(filters).skip(skip).limit(limitNumber);
    const totalRecipes = yield recipe_1.default.countDocuments(filters);
    return { result, totalRecipes };
});
exports.fetchRecipes = fetchRecipes;
const categoryTranslations = {
    breakfast: { en: "Breakfast", pl: "Śniadanie" },
    miscellaneous: { en: "Miscellaneous", pl: "Różne" },
    chicken: { en: "Chicken", pl: "Kurczak" },
    dessert: { en: "Dessert", pl: "Desery" },
};
const sectionTranslations = {
    breakfast: { en: "Breakfast", pl: "Śniadanie" },
    miscellaneous: { en: "Miscellaneous", pl: "Różne" },
    chicken: { en: "Chicken", pl: "Kurczak" },
    dessert: { en: "Dessert", pl: "Desery" },
};
const fetchRecipesByFourCategories = (count, lang) => __awaiter(void 0, void 0, void 0, function* () {
    const options = [
        {
            $project: {
                _id: 1,
                category: 1,
                preview: 1,
                thumb: 1,
                title: { $ifNull: [`$translations.${lang}.title`, "$title"] },
            },
        },
        { $limit: count },
    ];
    // Dynamiczne budowanie `$facet`
    const facetObject = Object.entries(categoryTranslations).reduce((acc, [key, translations]) => {
        const translatedCategory = translations[lang] || translations.en; // Domyślnie angielski
        const translatedSection = sectionTranslations[key][lang] || sectionTranslations[key].en; // Domyślna nazwa sekcji
        acc[translatedSection] = [{ $match: { category: translatedCategory } }, ...options];
        return acc;
    }, {});
    return yield recipe_1.default.aggregate([{ $facet: facetObject }]);
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
const fetchCategoriesListPl = () => __awaiter(void 0, void 0, void 0, function* () {
    const categories = yield categoryPl_1.default.find();
    const catArr = categories
        .map((cat) => cat.title)
        .sort((a, b) => a.localeCompare(b));
    return { catArr };
});
exports.fetchCategoriesListPl = fetchCategoriesListPl;
const fetchRecipesByCategory = (category, pageNumber, limitNumber) => __awaiter(void 0, void 0, void 0, function* () {
    const skip = (pageNumber - 1) * limitNumber;
    const result = yield recipe_1.default.find({ category }).skip(skip).limit(limitNumber);
    const total = yield recipe_1.default.countDocuments({ category });
    return { result, total };
});
exports.fetchRecipesByCategory = fetchRecipesByCategory;
const fetchRecipeById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield recipe_1.default.findById(id);
});
exports.fetchRecipeById = fetchRecipeById;
