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
exports.deleteIngredientFromShoppingList = exports.addIngredientToShoppingList = exports.getShoppingListByUserId = void 0;
const shoppingList_1 = __importDefault(require("../models/shoppingList"));
const getShoppingListByUserId = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const shoppingList = yield shoppingList_1.default.findOne({ userId });
    return shoppingList;
});
exports.getShoppingListByUserId = getShoppingListByUserId;
const addIngredientToShoppingList = (userId, ingredientData) => __awaiter(void 0, void 0, void 0, function* () {
    let shoppingList = yield shoppingList_1.default.findOne({ userId });
    if (!shoppingList) {
        shoppingList = new shoppingList_1.default({ userId, items: [] });
    }
    yield shoppingList_1.default.updateOne({ userId }, { $push: { items: ingredientData } });
    return shoppingList;
});
exports.addIngredientToShoppingList = addIngredientToShoppingList;
const deleteIngredientFromShoppingList = (userId, ingredientData) => __awaiter(void 0, void 0, void 0, function* () {
    yield shoppingList_1.default.updateOne({ userId }, { $pull: { items: ingredientData } });
});
exports.deleteIngredientFromShoppingList = deleteIngredientFromShoppingList;
