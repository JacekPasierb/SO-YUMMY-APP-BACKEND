const mongoose = require("mongoose");
const { Schema } = mongoose;

const shoppingListSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  items: [
    {
      ingredientId: { type: mongoose.Schema.Types.ObjectId, ref: "ingredient" },
      thb: String,
      name: { type: String, required: true },
      measure: { type: String, required: true },
      recipeId: { type: mongoose.Schema.Types.ObjectId, ref: "recipe" },
    },
  ],
});

const ShoppingList = mongoose.model("shoppingList", shoppingListSchema);

module.exports = ShoppingList;
