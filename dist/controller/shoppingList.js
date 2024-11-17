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
exports.deleteIngredient = exports.addIngredient = exports.getShoppingList = void 0;
const shoppingList_1 = __importDefault(require("../models/shoppingList"));
const handleErrors_1 = __importDefault(require("../utils/handleErrors"));
const getShoppingList = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return next((0, handleErrors_1.default)(401, "Unauthorized"));
        }
        const userId = req.user._id;
        const shoppingList = yield shoppingList_1.default.findOne({ userId });
        if (!shoppingList) {
            return next((0, handleErrors_1.default)(404));
        }
        res.status(200).json(shoppingList);
    }
    catch (error) {
        const err = error;
        next((0, handleErrors_1.default)(500, `Internal server error: ${err.message}`));
    }
});
exports.getShoppingList = getShoppingList;
const addIngredient = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return next((0, handleErrors_1.default)(401, "Unauthorized"));
        }
        const { ingredientId, thb, name, measure, recipeId } = req.body;
        const userId = req.user._id;
        let shoppingList = yield shoppingList_1.default.findOne({ userId });
        if (!shoppingList) {
            shoppingList = new shoppingList_1.default({ userId, items: [] });
        }
        yield shoppingList_1.default.updateOne({ userId }, { $push: { items: { ingredientId, thb, name, measure, recipeId } } });
        res.status(201).json({
            message: "Składnik dodany do listy zakupów",
            shoppingList,
        });
    }
    catch (error) {
        const err = error;
        next((0, handleErrors_1.default)(500, `Error adding ingredient to shopping list: ${err.message}`));
    }
});
exports.addIngredient = addIngredient;
const deleteIngredient = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return next((0, handleErrors_1.default)(401, "Unauthorized"));
        }
        const { ingredientId, recipeId } = req.body;
        const userId = req.user._id;
        yield shoppingList_1.default.updateOne({ userId }, { $pull: { items: { ingredientId, recipeId } } });
        res.status(200).json({
            message: "Składnik usunięty z listy zakupów",
        });
    }
    catch (error) {
        const err = error;
        next((0, handleErrors_1.default)(500, `Error removing ingredient from shopping list: ${err.message}`));
    }
});
exports.deleteIngredient = deleteIngredient;
