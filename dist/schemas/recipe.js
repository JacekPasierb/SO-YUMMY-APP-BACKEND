"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const recipeSchema = joi_1.default.object({
    file: joi_1.default.any(),
    title: joi_1.default.string().required(),
    description: joi_1.default.string().required(),
    category: joi_1.default.string().required(),
    time: joi_1.default.string().required(),
    ingredients: joi_1.default.array(),
    instructions: joi_1.default.string().required(),
    imageUrl: joi_1.default.any(),
    thumb: joi_1.default.any(),
    preview: joi_1.default.any(),
});
exports.default = recipeSchema;
