import { Request, Response, NextFunction } from "express";
import ShoppingList from "../models/shoppingList";
import handleError from "../utils/handleErrors";
import { IUser } from "../models/user";

const getShoppingList = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(handleError(401, "Unauthorized"));
    }
    const userId = (req.user as IUser)._id; 
    const shoppingList = await ShoppingList.findOne({ userId });

    if (!shoppingList) {
      return next(handleError(404));
    }

    res.status(200).json(shoppingList);
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
    if (!req.user) {
      return next(handleError(401, "Unauthorized"));
    }
    const { ingredientId, thb, name, measure, recipeId } = req.body;
    const userId = (req.user as IUser)._id; 
    let shoppingList = await ShoppingList.findOne({ userId });

    if (!shoppingList) {
      shoppingList = new ShoppingList({ userId, items: [] });
    }

    await ShoppingList.updateOne(
      { userId },
      { $push: { items: { ingredientId, thb, name, measure, recipeId } } }
    );

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
    if (!req.user) {
      return next(handleError(401, "Unauthorized"));
    }
    const { ingredientId, recipeId } = req.body;
    const userId = (req.user as IUser)._id; 

    await ShoppingList.updateOne(
      { userId },
      { $pull: { items: { ingredientId, recipeId } } }
    );

    res.status(200).json({
      message: "Składnik usunięty z listy zakupów",
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

export { getShoppingList, addIngredient, deleteIngredient };
