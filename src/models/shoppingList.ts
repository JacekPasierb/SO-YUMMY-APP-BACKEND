import { Schema, model, Document, Model, Types } from "mongoose";

interface IShoppingListItem {
  ingredientId: Types.ObjectId;
  thb?: string;
  name: string;
  measure: string;
  recipeId?: Types.ObjectId;
}

interface IShoppingList extends Document {
  userId: Types.ObjectId;
  items: IShoppingListItem[];
}

const shoppingListSchema = new Schema<IShoppingList>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    items: [
      {
        ingredientId: { type: Schema.Types.ObjectId, ref: "ingredient" },
        thb: String,
        name: { type: String, required: true },
        measure: { type: String, required: true },
        recipeId: { type: Schema.Types.ObjectId, ref: "recipe" },
      },
    ],
  },
  { versionKey: false }
);

const ShoppingList: Model<IShoppingList> = model("shoppingList", shoppingListSchema);

export default ShoppingList; 