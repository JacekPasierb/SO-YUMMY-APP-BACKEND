const { Ingredient } = require("../models/ingedientModel");

const getAllIngredients = async (req, res, next) => {
    try {
        const ingredients = await Ingredient.find();

        res.status(200).json({
            status: "success",
            code: 200,
            data: {
              ingredients
            },
          });
    } catch (error) {
        next(error)
    }
};

module.exports = {
    getAllIngredients
}