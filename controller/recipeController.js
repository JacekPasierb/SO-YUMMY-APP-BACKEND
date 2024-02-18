const Recipe = require("../models/recipeModel");

const getRecipesByFourCategories = async (req, res, next) => {
  try {
    const { count = 1 } = req.query;
    // const breakfast = await Recipe.find({
    //   category: "Breakfast",
    // }).limit(count);

    const options = [
      {
        $project: {
          _id: 1,
          title: 1,
          category: 1,
          preview: 1,
          thumb: 1,
        },
      },
      { $limit: count },
    ];

    const result = await Recipe.aggregate([
      {
        $facet: {
          breakfast: [{ $match: { category: "Breakfast" } }, ...options],
          miscellaneous: [
            { $match: { category: "Miscellaneous" } },
            ...options,
          ],
          chicken: [{ $match: { category: "Chicken" } }, ...options],
          dessert: [{ $match: { category: "Dessert" } }, ...options],
        },
      },
    ]);

    res.status(200).json({
      status: "success",
      code: 200,
      data: {
        ...result[0],
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getRecipesByFourCategories };
