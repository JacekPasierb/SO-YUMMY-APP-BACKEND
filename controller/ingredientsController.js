const { Ingredient } = require("../models/ingredientModel");

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
    console.log("sk",id);
    
    const ingredient = await Ingredient.findById(id);
    console.log("skladnik",ingredient);
    
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
