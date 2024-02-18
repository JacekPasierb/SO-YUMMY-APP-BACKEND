const Recipe = require("../models/recipeModel");

const getRecipesByFourCategories = async (req, res, next) => {
  try {
    const { count = 1 } = req.query;
    const breakfast = await Recipe.find({
      category: "Breakfast",
    }).limit(count);

    const miscellaneous = await Recipe.find({
      category: "Miscellaneous",
    }).limit(count);

    const chicken = await Recipe.find({
      category: "Chicken",
    }).limit(count);

    const dessert = await Recipe.aggregate([
      { $match: { category: "Dessert" } },
      { 
        $sort: { "title": 1 } 
      },
      {
        $project: {
          title: 1,
          category: 1,
        },
      },
      { $limit: 2 }
    ]);

    res.status(200).json({
      status: "success",
      code: 200,
      data: {
        count,
        breakfast,
        miscellaneous,
        chicken,
        dessert,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getRecipesByFourCategories };
