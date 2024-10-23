const ShoppingList = require("../models/shoppingListModel");

const getShoppingList = async (req, res, next) => {
  try {
    const shoppingList = await ShoppingList.findOne({ userId: req.user._id });

    if (!shoppingList) {
      return res.status(404).json({ message: "Lista zakupów nie znaleziona" });
    }

    res.status(200).json(shoppingList);
  } catch (error) {
    next(error);
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
    // shoppingList.items.push({ ingredientId, thb, name, measure, recipeId });

    // await shoppingList.save();

    await ShoppingList.updateOne(
        { userId },
        { $push: { items: { ingredientId, thb, name, measure, recipeId } } }
      );

    return res.status(201).json({
      message: "Składnik dodany do listy zakupów",
      shoppingList,
    });
  } catch (error) {
    next(error);
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
    next(error);
  }
};

module.exports = {
  getShoppingList,
  addIngredient,
  deleteIngredient,
};
