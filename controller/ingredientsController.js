const { Ingredient } = require("../models/ingedientModel");

const getAllIngredients = async (req, res, next) => {
  try {
    const ingredients = await Ingredient.find();

    res.status(200).json({
      status: "success",
      code: 200,
      data: {
        ingredients,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getIngredientById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ingredient = await Ingredient.findById(id);
    res.status(200).json({
      status: "success",
      code: 200,
      data: {
        ingredient,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllIngredients,
  getIngredientById,
};
