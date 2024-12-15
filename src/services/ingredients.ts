import Ingredient from "../models/ingredient";

const fetchAllIngredients = async () => {
  return await Ingredient.find();
};

const fetchIngredientById = async (id: string) => {
  return await Ingredient.findById(id);
};

const fetchIngredientByName = async (ingredient:string)=>{
  return await Ingredient.findOne({
    ttl: { $regex: ingredient, $options: "i" },
  });
}

export { fetchAllIngredients, fetchIngredientById , fetchIngredientByName};