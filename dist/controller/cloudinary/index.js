"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ctrlWrapper_1 = __importDefault(require("./ctrlWrapper"));
const saveImages_1 = __importDefault(require("./saveImages"));
exports.default = {
    saveImages: (0, ctrlWrapper_1.default)(saveImages_1.default),
};
