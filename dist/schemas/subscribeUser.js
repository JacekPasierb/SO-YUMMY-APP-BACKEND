"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const subscribeUserSchema = joi_1.default.object({
    email: joi_1.default.string()
        .pattern(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/)
        .required()
        .messages({
        "string.pattern.base": "Invalid email format",
        "any.required": "Email is required",
    }),
});
exports.default = subscribeUserSchema;
