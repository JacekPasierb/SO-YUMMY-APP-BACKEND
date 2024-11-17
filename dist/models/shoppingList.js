"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const shoppingListSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    items: [
        {
            ingredientId: { type: mongoose_1.Schema.Types.ObjectId, ref: "ingredient" },
            thb: String,
            name: { type: String, required: true },
            measure: { type: String, required: true },
            recipeId: { type: mongoose_1.Schema.Types.ObjectId, ref: "recipe" },
        },
    ],
}, { versionKey: false });
const ShoppingList = (0, mongoose_1.model)("shoppingList", shoppingListSchema);
exports.default = ShoppingList;
