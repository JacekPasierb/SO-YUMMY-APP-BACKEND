import Ingredient from "../models/ingredient";

const fetchAllIngredients = async () => {
  return await Ingredient.find();
};

const fetchIngredientById = async (id: string) => {
  return await Ingredient.findById(id);
};

export { fetchAllIngredients, fetchIngredientById };