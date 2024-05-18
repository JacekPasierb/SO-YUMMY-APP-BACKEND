const Recipe = require("../models/recipeModel");

const addToFavorites = async (req, res, next) => {
  try {
    const { recipeId } = req.params;
    const userId = req.user.id;

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: `Recipe not found` });
    }

    if (recipe.favorites.includes(userId)) {
      return res.status(400).json({ message: "Recipe already in favorites" });
    }

    recipe.favorites.push(userId);
    await recipe.save();

    res.status(200).json({ message: "Recipe added to favorites", recipe });
  } catch (error) {
    res.status(500).json({ message: `Recipe, ${error.message} `});
  }
};


const removeFromFavorite = async(req,res,next)=>{
try {
  const { recipeId } = req.params;
  const userId = req.user.id;

  const recipe = await Recipe.findById(recipeId);
  if (!recipe) {
    return res.status(404).json({ message: `Recipe not found` });
  }
  recipe.favorite = recipe.favorites.filter(id => id !== userId)
  await recipe.save();

  res.status(200).json({ message: `Removed from favorites successfully` });
} catch (error) {
  res.status(500).json({ message: `Recipe, ${error.message} `});
}
}
module.exports = {
  addToFavorites,
  removeFromFavorite
};
