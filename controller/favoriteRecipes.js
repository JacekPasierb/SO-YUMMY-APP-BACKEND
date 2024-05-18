const Recipe = require("../models/recipeModel");

const addToFavorites = async (req, res, next) => {
  try {
    const { recipeId } = req.params;
    const userId = req.user.id;

    const recipe = await Recipe.findByIdAndUpdate(
      recipeId,
      { $addToSet: { favorites: userId } },
      { new: true }
    );

    if (!recipe) {
      return res.status(404).json({ message: `Recipe not found` });
    }

    res.status(200).json({ message: "Recipe added to favorites" });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Error while add Recipe, ${error.message} ` });
  }
};

const removeFromFavorite = async (req, res, next) => {
  try {
    const { recipeId } = req.params;
    const userId = req.user.id;

    const recipe = await Recipe.findByIdAndUpdate(
      recipeId,
      { $pull: { favorites: userId } },
      { new: true }
    );
    if (!recipe) {
      return res.status(404).json({ message: `Recipe not found` });
    }

    res.status(200).json({ message: `Removed from favorites successfully` });
  } catch (error) {
    res.status(500).json({
      message: `Error while remove Recipe from favorites:, ${error.message} `,
    });
  }
};
module.exports = {
  addToFavorites,
  removeFromFavorite,
};
