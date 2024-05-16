const Recipe = require("../models/recipeModel");

const addToFavorites = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    if (recipe.favorites.includes(userId)) {
      return res.status(400).json({ message: "Recipe already in favorites" });
    }

    recipe.favorites.push(userId);
    await recipe.save();

    res.status(200).json({ message: "Recipe added to favorites", recipe });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  addToFavorites,
};
