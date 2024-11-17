"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toogleThemeSchema = exports.updateUserSchema = exports.signinSchema = exports.registerSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const registerSchema = joi_1.default.object({
    name: joi_1.default.string().min(3).trim().required().messages({
        "string.base": "Name must be a string",
        "string.min": "Name must be at least 3 characters long",
        "any.required": "Name is required",
    }),
    email: joi_1.default.string().email().trim().required().messages({
        "string.base": "E-mail must be a string",
        "string.email": "Enter a valid email address",
        "any.required": "Email is required",
    }),
    password: joi_1.default.string().min(6).trim().required().messages({
        "string.base": "Password must be a string",
        "string.min": "Password must be at least 6 characters long",
        "any.required": "Password is required",
    }),
});
exports.registerSchema = registerSchema;
const updateUserSchema = joi_1.default.object({
    avatar: joi_1.default.string(),
    name: joi_1.default.string().min(3).trim().messages({
        "string.base": "Name must be a string",
        "string.min": "Name must be at least 3 characters long",
    }),
});
exports.updateUserSchema = updateUserSchema;
const toogleThemeSchema = joi_1.default.object({
    isDarkTheme: joi_1.default.boolean(),
});
exports.toogleThemeSchema = toogleThemeSchema;
const signinSchema = joi_1.default.object({
    email: joi_1.default.string().email().trim().required().messages({
        "string.base": "E-mail must be a string",
        "string.email": "Enter a valid email address",
        "any.required": "Email is required",
    }),
    password: joi_1.default.string().min(6).trim().required().messages({
        "string.base": "Password must be a string",
        "string.min": "Password must be at least 6 characters long",
        "any.required": "Password is required",
    }),
});
exports.signinSchema = signinSchema;
