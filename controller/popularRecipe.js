const Recipe = require("../models/recipeModel");

const getPopularRecipes = async (req, res, next) => {
  try {
    const popularRecipes = await Recipe.aggregate([
      { $match: { "favorites.0": { $exists: true } } },
      { $sort: { "favorites.length": -1 } }, 
      { $limit: 4 }, 
    ]);

    res.status(200).json({
      popularRecipes,
    });
  } catch (error) {
    res.status(500).json({
      message: `Error while get popular Recipe:, ${error.message} `,
    });
  }
};

module.exports = {
  getPopularRecipes,
};
