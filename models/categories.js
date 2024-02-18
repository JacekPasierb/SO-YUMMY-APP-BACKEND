const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const categorySchema = new Schema(
  {
    title: String,
    thumb: String,
    description: String,
  },
  { versionKey: false }
);

const Category = model("category", categorySchema);

module.exports = { Category };
