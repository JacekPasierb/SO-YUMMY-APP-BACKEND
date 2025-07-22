import {Types} from "mongoose";
import ShoppingList from "../models/shoppingList";

const getShoppingListByUserId = async (userId: Types.ObjectId) => {
  const shoppingList = await ShoppingList.findOne({userId});

  return shoppingList;
};

const addIngredientToShoppingList = async (
  userId: Types.ObjectId,
  ingredientData: {
    ingredientId: string;
    thb: number;
    name: string;
    measure: string;
    recipeId: string;
  }
) => {
  let shoppingList = await ShoppingList.findOne({userId});
console.log("shop",shoppingList);

  if (!shoppingList) {
    console.log("bedzie tworzyc");
    
    shoppingList = new ShoppingList({userId, items: []});
  }
  await shoppingList.save();
  await ShoppingList.updateOne({userId}, {$push: {items: ingredientData}});

  return shoppingList;
};

const deleteIngredientFromShoppingList = async (
  userId: Types.ObjectId,
  ingredientData: {ingredientId: string; recipeId: string}
) => {
  await ShoppingList.updateOne({userId}, {$pull: {items: ingredientData}});
};

export {
  getShoppingListByUserId,
  addIngredientToShoppingList,
  deleteIngredientFromShoppingList,
};
