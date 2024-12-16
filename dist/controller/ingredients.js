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
exports.getIngredientById = exports.getAllIngredients = void 0;
const handleErrors_1 = __importDefault(require("../utils/handleErrors"));
const ingredients_1 = require("../services/ingredients");
const getAllIngredients = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ingredients = yield (0, ingredients_1.fetchAllIngredients)();
        res.status(200).json({
            status: "success",
            code: 200,
            data: {
                ingredients,
            },
        });
    }
    catch (error) {
        next((0, handleErrors_1.default)(500, `Error fetching ingredients`));
    }
});
exports.getAllIngredients = getAllIngredients;
const getIngredientById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const ingredient = yield (0, ingredients_1.fetchIngredientById)(id);
        if (!ingredient) {
            return next((0, handleErrors_1.default)(404, "Ingredient not found"));
        }
        res.status(200).json({
            status: "success",
            code: 200,
            data: {
                ingredient,
            },
        });
    }
    catch (error) {
        next((0, handleErrors_1.default)(500, error.message));
    }
});
exports.getIngredientById = getIngredientById;
