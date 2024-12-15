import Recipe from "../models/recipe";

const fetchPopularRecipes = async (count: number) => {
    return Recipe.aggregate([
      { $match: { "favorites.0": { $exists: true } } },
      { $sort: { "favorites.length": -1 } },
      { $limit: count },
    ]);
  };

  export {
    fetchPopularRecipes,
  };