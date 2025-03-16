import { Schema, model, Document, Model, Types } from "mongoose";

interface IIngredient {
  id: Types.ObjectId;
  measure: string;
}

interface IRecipe extends Document {
  _id: Types.ObjectId;
  title: string;
  category: string;
  area?: string;
  instructions: string;
  description: string;
  thumb?: string;
  preview?: string;
  time: string;
  favorites: string[];
  youtube?: string;
  tags: string[];
  ingredients: IIngredient[];
  owner?: Types.ObjectId;
}

const recipeSchema = new Schema<IRecipe>(
  {
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
      type: [new Schema({
        id: {
          type: Schema.Types.ObjectId,
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
      type: Schema.Types.ObjectId,
      ref: "user",
    },
  },
  { versionKey: false, timestamps: true }
);

const Recipe: Model<IRecipe> = model("recipe", recipeSchema);

export default Recipe;
export type { IRecipe };
