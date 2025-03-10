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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPopularRecipes = void 0;
const popularRecipe_1 = require("../services/popularRecipe");
const getPopularRecipes = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const count = Number(req.query.count) || 4;
        const popularRecipes = yield (0, popularRecipe_1.fetchPopularRecipes)(count);
        res.status(200).json({
            popularRecipes,
        });
    }
    catch (error) {
        next({
            status: 500,
            message: `Error while getting popular recipes: ${error.message}`,
        });
    }
});
exports.getPopularRecipes = getPopularRecipes;
