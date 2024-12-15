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
exports.deleteOwnRecipe = exports.addOwnRecipe = exports.getOwnRecipes = void 0;
const handleErrors_1 = __importDefault(require("../utils/handleErrors"));
const ownRecipe_1 = require("../services/ownRecipe");
const getOwnRecipes = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user._id;
        let { page = 1, limit = 4 } = req.query;
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        if (isNaN(pageNumber) ||
            isNaN(limitNumber) ||
            pageNumber < 1 ||
            limitNumber < 1) {
            return next((0, handleErrors_1.default)(400, "Invalid pagination parameters"));
        }
        const { recipes: ownRecipes, totalOwnRecipes } = yield (0, ownRecipe_1.fetchOwnRecipes)(userId, pageNumber, limitNumber);
        if (totalOwnRecipes === 0) {
            return next((0, handleErrors_1.default)(404, "Not found own recipes"));
        }
        const totalPages = Math.ceil(totalOwnRecipes / limitNumber);
        if (pageNumber > totalPages) {
            return next((0, handleErrors_1.default)(404, "Page number exceeds total number of available pages"));
        }
        res.status(200).json({
            status: "success",
            code: 200,
            data: {
                ownRecipes,
                totalOwnRecipes,
            },
        });
    }
    catch (error) {
        next((0, handleErrors_1.default)(500, error.message));
    }
});
exports.getOwnRecipes = getOwnRecipes;
const addOwnRecipe = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user._id;
        const newRecipe = yield (0, ownRecipe_1.createRecipe)(Object.assign(Object.assign({}, req.body), { owner: userId }));
        res.status(200).json({
            status: "success",
            code: 200,
            data: {
                newRecipe,
            },
        });
    }
    catch (error) {
        next((0, handleErrors_1.default)(500, error.message));
    }
});
exports.addOwnRecipe = addOwnRecipe;
const deleteOwnRecipe = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { recipeId } = req.params;
        const result = yield (0, ownRecipe_1.deleteRecipeById)(recipeId);
        if (!result) {
            return next((0, handleErrors_1.default)(404, "Recipe not found..."));
        }
        res.status(200).json({
            status: "success",
            code: 200,
            message: "Recipe deleted",
        });
    }
    catch (error) {
        next((0, handleErrors_1.default)(500, error.message));
    }
});
exports.deleteOwnRecipe = deleteOwnRecipe;
