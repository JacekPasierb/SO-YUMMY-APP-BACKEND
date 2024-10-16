const { Category } = require("../models/categories");
const Recipe = require("../models/recipeModel");
const handleError = require("../utils/handleErrors");

const getRecipes = async(req,res,next)=>{
  try {
    const {query, ingredient} = req.query;
    if(query){
      filters.title = { $regex: query, $options: "i" };
      const result = await  Recipe.find(filters);
        return result
    }
    const totalRecipes = result.length;

    res.status(200).json({
      status: "success",
      code: 200,
      data: {
        result,
        totalRecipes,
      },
    });
  } catch (error) {
    next(error);
  }
}

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
      { $limit: Number(count) },
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

const getCategoriesList = async (req, res, next) => {
  try {
    const categories = await Category.find();
    const catArr = categories.map((cat) => cat.title);
    catArr.sort((a, b) => a.localeCompare(b));

    res.status(200).json({
      status: "success",
      code: 200,
      data: {
        catArr,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getRecipesByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    let { page = 1, limit = 8 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    const result = await Recipe.find({ category: category })
      .skip(skip)
      .limit(limit);

    const totalRecipe = await Recipe.find({ category: category });

    if (result.length === 0) {
      return handleError(404, "Not found recipes by such category");
    }
    const total = totalRecipe.length;
    
    res.status(200).json({
      status: "success",
      code: 200,
      data: {
        result,
        total,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getRecipeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await Recipe.findById(id);

    res.status(200).json({
      status: "success",
      code: 200,
      data: {
        result,
      },
    });
  } catch (error) {
    next(error);
  }
};

// const getPopularRecipe = async (req, res, next) => {
//   try {
//     const result = await Recipe.find({ category: category })
//   } catch (error) {
//     next(error);
//   }
// }

module.exports = {
  getRecipes,
  getRecipesByFourCategories,
  getCategoriesList,
  getRecipesByCategory,
  getRecipeById,
  
};
