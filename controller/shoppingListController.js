const ShoppingList = require("../models/shoppingListModel");
const handleError = require("../utils/handleErrors");

const getShoppingList = async (req, res, next) => {
  try {
    const shoppingList = await ShoppingList.findOne({ userId: req.user._id });

    if (!shoppingList) {
      return next(handleError(404));
    }

    res.status(200).json(shoppingList);
  } catch (error) {
    next(handleError(500, `Internal server error: ${error.message}`));
  }
};

const addIngredient = async (req, res, next) => {
  try {
    const { ingredientId, thb, name, measure, recipeId } = req.body;
    const userId = req.user._id;
    let shoppingList = await ShoppingList.findOne({ userId });

    if (!shoppingList) {
      shoppingList = new ShoppingList({ userId, items: [] });
    }

    await ShoppingList.updateOne(
      { userId },
      { $push: { items: { ingredientId, thb, name, measure, recipeId } } }
    );

    return res.status(201).json({
      message: "Składnik dodany do listy zakupów",
      shoppingList,
    });
  } catch (error) {
    next(
      handleError(
        500,
        `Error adding ingredient to shopping list: ${error.message}`
      )
    );
  }
};

const deleteIngredient = async (req, res, next) => {
  try {
    const { ingredientId, recipeId } = req.body;
    const userId = req.user._id;

    await ShoppingList.updateOne(
      { userId },
      { $pull: { items: { ingredientId, recipeId } } }
    );

    res.status(200).json({
      message: "Składnik usunięty z listy zakupów",
    });
  } catch (error) {
    next(
      handleError(
        500,
        `Error removing ingredient from shopping list: ${error.message}`
      )
    );
  }
};

module.exports = {
  getShoppingList,
  addIngredient,
  deleteIngredient,
};
