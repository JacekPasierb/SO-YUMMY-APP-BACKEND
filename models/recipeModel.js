const mongoose = require("mongoose");
const { Schema } = mongoose;

const recipeSchema = new Schema({
  title: {
    type: String,
    require: [true, "Name for recipe is required"],
  },
  category: {
    type: String,
    require: [true, "Category is required"],
  },
  area: {
    type: String,
  },
  instructions: {
    type: String,
    require: [true, "Instructions is required"],
  },
  description: {
    type: String,
    require: [true, "Description is required"],
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
    require: [true, "Time is required"],
    default: "",
  },
  favorites: {
    type: [Schema.Types.ObjectId],
    ref: "user",
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
});
