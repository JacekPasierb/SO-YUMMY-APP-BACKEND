"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ingredientSchema = new mongoose_1.Schema({
    ttl: { type: String, required: true },
    ttlPl: { type: String, required: true },
    desc: { type: String, required: true },
    t: { type: String, required: true },
    thb: { type: String, required: true },
}, { versionKey: false });
const Ingredient = (0, mongoose_1.model)("ingredient", ingredientSchema);
exports.default = Ingredient;
