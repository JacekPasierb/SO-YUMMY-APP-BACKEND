const ShoppingList = require("../models/shoppingListModel");

const getShoppingList = async (req, res, next) => {
  try {
    console.log("1");
    
    const { recipeId } = req.params; 
    const shoppingList = await ShoppingList.findOne({ userId: req.user._id });
console.log("2", shoppingList);

    if (!shoppingList) {
      return res.status(404).json({ message: "Lista zakupów nie znaleziona" });
    }

    const items = recipeId
    ? shoppingList.items.filter(item => item.recipeId === recipeId)
    : shoppingList.items;

  res.status(200).json({ items });
 
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
