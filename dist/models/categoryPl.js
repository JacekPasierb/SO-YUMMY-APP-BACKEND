"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const categorySchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    thumb: { type: String, required: true },
    description: { type: String, required: true },
}, { versionKey: false });
const CategoryPl = (0, mongoose_1.model)("category", categorySchema);
exports.default = CategoryPl;
