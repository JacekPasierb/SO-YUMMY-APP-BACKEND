import { Schema, model, Document, Model } from "mongoose";

interface ICategoryPl extends Document {
  title: string;
  thumb: string;
  description: string;
}

const categorySchemaPl = new Schema<ICategoryPl>(
  {
    title: { type: String, required: true },
    thumb: { type: String, required: true },
    description: { type: String, required: true },
  },
  { versionKey: false }
);

const CategoryPl: Model<ICategoryPl> = model("categoryPl", categorySchemaPl);

export default CategoryPl;
