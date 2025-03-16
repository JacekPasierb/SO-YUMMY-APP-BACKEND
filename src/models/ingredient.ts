import { Schema, model, Document, Model } from "mongoose";
import { Types } from "mongoose";

interface IIngredient extends Document {
  _id: Types.ObjectId;
  ttl: string;
  ttlPl: string;
  thb: string;
  t: string;
  desc: string;
}

const ingredientSchema = new Schema<IIngredient>(
  {
    ttl: { type: String, required: true },
    ttlPl: { type: String, required: true },
    desc: { type: String, required: true },
    t: { type: String, required: true },
    thb: { type: String, required: true },
  },
  { versionKey: false }
);

const Ingredient: Model<IIngredient> = model("ingredient", ingredientSchema);

export default Ingredient;
export type { IIngredient }; 