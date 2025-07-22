import {Request, Response, NextFunction} from "express";
import handleError from "../utils/handleErrors";
import {IUser} from "../models/user";
import {
  addIngredientToShoppingList,
  deleteIngredientFromShoppingList,
  getShoppingListByUserId,
} from "../services/shoppingList";

const getShoppingList = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req.user as IUser)._id;

    const shoppingList = await getShoppingListByUserId(userId);

    !shoppingList
      ? res.status(200).json({items: []})
      : res.status(200).json(shoppingList);
  } catch (error) {
    const err = error as Error;
    next(handleError(500, `Internal server error: ${err.message}`));
  }
};

const addIngredient = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {ingredientId, thb, name, measure, recipeId} = req.body;
    const userId = (req.user as IUser)._id;
    console.log("userI", userId);
    
    const shoppingList = await addIngredientToShoppingList(userId, {
      ingredientId,
      thb,
      name,
      measure,
      recipeId,
    });

    res.status(201).json({
      message: "Składnik dodany do listy zakupów",
      shoppingList,
    });
  } catch (error) {
    const err = error as Error;
    next(
      handleError(
        500,
        `Error adding ingredient to shopping list: ${err.message}`
      )
    );
  }
};

const deleteIngredient = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {ingredientId, recipeId} = req.body;
    const userId = (req.user as IUser)._id;

    await deleteIngredientFromShoppingList(userId, {ingredientId, recipeId});

    res.status(200).json({
      message: "Item removed successfully",
    });
  } catch (error) {
    const err = error as Error;
    next(
      handleError(
        500,
        `Error removing ingredient from shopping list: ${err.message}`
      )
    );
  }
};

export {getShoppingList, addIngredient, deleteIngredient};
