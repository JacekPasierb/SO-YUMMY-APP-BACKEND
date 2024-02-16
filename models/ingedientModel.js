const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const ingredientSchema = new Schema(
  {
    ttl: String,
    desc: String,
    t: String,
    thb: String,
  },
  { versionKey: false }
);

const Ingredient = model("ingredient", ingredientSchema);

module.exports = { Ingredient };
