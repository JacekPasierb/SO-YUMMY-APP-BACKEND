const Recipe = require("../models/recipeModel");
const handleError = require("../utils/handleErrors");

const getOwnRecipes = async (req, res, next) => {
  try {
    const userId = req?.user?._id;
    let { page = 1, limit = 4 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    const ownRecipes = await Recipe.find({ owner: userId })
      .skip(skip)
      .limit(limit);

      const totalRecipes = await Recipe.find({ owner: userId });

    if (ownRecipes.length === 0) {
      return handleError(404, "Not found own recipes");
    }
    const totalOwnRecipes = totalRecipes.length;

    res.status(200).json({
      status: "success",
      code: 200,
      data: {
        ownRecipes,
        totalOwnRecipes,
      },
    });
  } catch (error) {
    next(error);
  }
};

const addOwnRecipe = async (req, res, next) => {
  try {
    const newRecipe = await Recipe.create({
      ...req.body,
      owner: req.user._id,
    });

    res.status(200).json({
      status: "success",
      code: 200,
      data: {
        newRecipe,
      },
    });
  } catch (error) {
    next(error);
  }
};

const deleteOwnRecipe = async (req, res, next) => {
  try {
    const { recipeId } = req.params;
    const result = await Recipe.findByIdAndDelete(recipeId);
    if (!result) {
      return handleError(404, "Recipe not found...");
    }
    res.status(200).json({
      status: "success",
      code: 200,
      message: "Recipe deleted",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOwnRecipes,
  addOwnRecipe,
  deleteOwnRecipe,
};
