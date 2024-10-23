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
    shoppingList.items.push({ ingredientId, thb, name, measure, recipeId });

    await shoppingList.save();

    return res.status(201).json({
      message: "Składnik dodany do listy zakupów",
      shoppingList
    });
  } catch (error) {
    next(error);
  }
};

const deleteIngredient = async (req, res, next) => {
    try {
        const { ingredientId } = req.params;
        const userId = req.user._id;
    
        
        const shoppingList = await ShoppingList.findOne({ userId });
    
        if (!shoppingList) {
          return res.status(404).json({ message: "Lista zakupów nie znaleziona" });
        }
    
        shoppingList.items = shoppingList.items.filter(
            (item) => item.ingredientId !== ingredientId
          );
    
    
        // Zapisz zmiany
        await shoppingList.save();
    
        res.status(200).json({
          message: "Składnik usunięty z listy zakupów",
          shoppingList,
        });
      } catch (error) {
        next(error); // Przekazujemy błąd dalej do middleware obsługującego błędy
      }
};

module.exports = {
  getShoppingList,
  addIngredient,
  deleteIngredient,
};
