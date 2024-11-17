import { Schema, model, Document, Model } from "mongoose";

interface IIngredient extends Document {
  ttl: string;
  desc: string;
  t: string;
  thb: string;
}

const ingredientSchema = new Schema<IIngredient>(
  {
    ttl: { type: String, required: true },
    desc: { type: String, required: true },
    t: { type: String, required: true },
    thb: { type: String, required: true },
  },
  { versionKey: false }
);

const Ingredient: Model<IIngredient> = model("ingredient", ingredientSchema);

export default Ingredient; 