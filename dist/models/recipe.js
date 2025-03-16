"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const recipeSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, "Name for recipe is required"],
    },
    category: {
        type: String,
        required: [true, "Category is required"],
    },
    area: {
        type: String,
    },
    instructions: {
        type: String,
        required: [true, "Instructions is required"],
    },
    description: {
        type: String,
        required: [true, "Description is required"],
        default: "",
    },
    thumb: {
        type: String,
    },
    preview: {
        type: String,
    },
    time: {
        type: String,
        required: [true, "Time is required"],
        default: "",
    },
    favorites: {
        type: [String],
        default: [],
    },
    youtube: {
        type: String,
        default: "",
    },
    tags: {
        type: [String],
        default: [],
    },
    ingredients: {
        type: [new mongoose_1.Schema({
                id: {
                    type: mongoose_1.Schema.Types.ObjectId,
                    ref: "ingredient",
                    required: true,
                },
                measure: {
                    type: String,
                    default: "",
                },
            })],
        default: [],
    },
    owner: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "user",
    },
}, { versionKey: false, timestamps: true });
const Recipe = (0, mongoose_1.model)("recipe", recipeSchema);
exports.default = Recipe;
