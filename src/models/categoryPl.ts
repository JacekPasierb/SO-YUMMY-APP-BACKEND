import { Schema, model, Document, Model } from "mongoose";

interface ICategory extends Document {
  title: string;
  thumb: string;
  description: string;
}

const categorySchema = new Schema<ICategory>(
  {
    title: { type: String, required: true },
    thumb: { type: String, required: true },
    description: { type: String, required: true },
  },
  { versionKey: false }
);

const CategoryPl: Model<ICategory> = model("categoryPl", categorySchema);

export default  CategoryPl ;
