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
const recipe_1 = __importDefault(require("../models/recipe"));
const handleErrors_1 = __importDefault(require("../utils/handleErrors"));
const getOwnRecipes = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!userId) {
            return next((0, handleErrors_1.default)(401, "Unauthorized"));
        }
        let { page = 1, limit = 4 } = req.query;
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        const skip = (pageNumber - 1) * limitNumber;
        const totalOwnRecipes = yield recipe_1.default.countDocuments({ owner: userId });
        const totalPages = Math.ceil(totalOwnRecipes / limitNumber);
        if (pageNumber > totalPages) {
            res.status(200).json({
                status: "success",
                code: 200,
                data: {
                    ownRecipes: [],
                    totalOwnRecipes,
                },
                message: "Page number exceeds total number of available pages.",
            });
            return;
        }
        const ownRecipes = yield recipe_1.default.find({ owner: userId })
            .skip(skip)
            .limit(limitNumber);
        if (ownRecipes.length === 0) {
            return next((0, handleErrors_1.default)(404, "Not found own recipes"));
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
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!userId) {
            return next((0, handleErrors_1.default)(401, "Unauthorized"));
        }
        const newRecipe = yield recipe_1.default.create(Object.assign(Object.assign({}, req.body), { owner: userId }));
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
        const result = yield recipe_1.default.findByIdAndDelete(recipeId);
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
