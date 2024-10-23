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
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      unit: { type: String, required: true },
    },
  ],
});

const ShoppingList = mongoose.model("shoppingList", shoppingListSchema);

module.exports = ShoppingList;
