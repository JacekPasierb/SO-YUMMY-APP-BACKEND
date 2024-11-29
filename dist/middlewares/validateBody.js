"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const handleErrors_1 = __importDefault(require("../utils/handleErrors"));
const validateBody = (schema) => {
    return (req, res, next) => {
        console.log("coo");
        const { error } = schema.validate(req.body);
        if (error) {
            console.log("co2", error);
            return next((0, handleErrors_1.default)(400, error.message));
        }
        next();
    };
};
exports.default = validateBody;
