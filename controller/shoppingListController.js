const ShoppingList = require("../models/shoppingListModel");

const getShoppingList = async (req, res, next) => {
  try {
  } catch (error) {}
};

const addIngredient = async (req, res, next) => {
  try {
    const { ingredientId, thb, name, measure, recipeId } = req.body;
    const userId = req.user._id;
    let shoppingList = await ShoppingList.findOne({ userId });
    console.log("shoppingList", shoppingList);
   
    
    
    if (!shoppingList) {
      shoppingList = new ShoppingList({ userId, items: [] });
    }
console.log("Składnie", ingredientId);

    shoppingList.items.push({ ingredientId, thb, name, measure, recipeId });
console.log("dochodzi tu?");

    return res.status(201).json({
      message: "Składnik dodany do listy zakupów",
      ingredient: newIngredient,
    });
  } catch (error) {
    res.status(500).json({
      message: `Error while add ingredient to shoppingList:, ${error.message} `,
    });
  }
};

const deleteIngredient = async (req, res, next) => {
  try {
  } catch (error) {}
};

module.exports = {
  getShoppingList,
  addIngredient,
  deleteIngredient,
};
