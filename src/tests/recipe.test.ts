import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import app from "../app";
import Recipe from "../models/recipe";
import { User } from "../models/user";
import jwt from "jsonwebtoken";
import Ingredient from "../models/ingredient";
import Category from "../models/category";

describe("Recipe API", () => {
  let mongoServer: MongoMemoryServer;
  let token: string;
  let recipeId: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    try {
      await mongoose.connect(uri);
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
    await Recipe.deleteMany({});

    await User.deleteMany({});
    await Ingredient.deleteMany({});

    // Tworzenie użytkownika testowego i generowanie tokena
    const user = await User.create({
      name: "Test User",
      email: "testuser@example.com",
      password: "password123",
      verify: true,
    });

    token = jwt.sign({ id: user._id }, process.env.SECRET as string, {
      expiresIn: "1h",
    });
    user.token = token;
    await user.save();

    const sugar = await Ingredient.create({
      ttl: "Sugar",
      thb: "thumbnail_url",
      t: "Sugar",
      desc: "Sweet ingredient",
    });

    const recipes = await Recipe.create([
      {
        title: "Chocolate Cake",
        description: "Delicious chocolate cake",
        category: "Dessert",
        time: 60,
        instructions: "Mix ingredients and bake",
        ingredients: [{ id: sugar._id }],
      },
      {
        title: "Vanilla Ice Cream",
        description: "Creamy vanilla ice cream",
        category: "Dessert",
        time: 30,
        instructions: "Mix ingredients and freeze",
        ingredients: [],
      },
      {
        title: "Pancakes",
        description: "Fluffy pancakes",
        category: "Breakfast",
        time: 20,
        instructions: "Mix ingredients and cook on a griddle",
        ingredients: [],
      },
      {
        title: "Omelette",
        description: "Simple omelette",
        category: "Breakfast",
        time: 10,
        instructions: "Beat eggs and cook",
        ingredients: [],
      },
      {
        title: "Chicken Curry",
        description: "Spicy chicken curry",
        category: "Chicken",
        time: 45,
        instructions: "Cook chicken with spices",
        ingredients: [],
      },
      {
        title: "Grilled Chicken",
        description: "Grilled chicken with herbs",
        category: "Chicken",
        time: 30,
        instructions: "Grill chicken with herbs",
        ingredients: [],
      },
      {
        title: "Fruit Salad",
        description: "Fresh fruit salad",
        category: "Miscellaneous",
        time: 10,
        instructions: "Mix fresh fruits",
        ingredients: [],
      },
      {
        title: "Smoothie",
        description: "Healthy fruit smoothie",
        category: "Miscellaneous",
        time: 5,
        instructions: "Blend fruits with yogurt",
        ingredients: [],
      },
    ]);
    recipeId = recipes[0]._id.toString();
  });

  describe("GET /api/recipes", () => {
    it("Should return a list of recipes", async () => {
      const res = await request(app)
        .get("/api/recipes")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.result).toHaveLength(6);
      expect(res.body.data.totalRecipes).toBe(8);
    });

    it("should filter recipes by title", async () => {
      const res = await request(app)
        .get("/api/recipes?query=Chocolate")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.result).toHaveLength(1);
      expect(res.body.data.result[0]).toHaveProperty("title", "Chocolate Cake");
    });

    it("should filter recipes by ingredient", async () => {
      const res = await request(app)
        .get("/api/recipes?ingredient=Sugar")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.result).toHaveLength(1);
      expect(res.body.data.result[0]).toHaveProperty("title", "Chocolate Cake");
    });

    it("should return 404 if ingredient not found", async () => {
      const res = await request(app)
        .get("/api/recipes?ingredient=NonExistent")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error", "Ingredient not found");
    });

    it("should handle invalid page and limit values gracefully", async () => {
      const res = await request(app)
        .get("/api/recipes?page=invalid&limit=invalid")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.result).toHaveLength(8);
    });

    it("should return 500 if an error occurs in catch", async () => {
      jest.spyOn(Recipe, "find").mockImplementationOnce(() => {
        throw new Error("Database error");
      });
      const res = await request(app)
        .get("/api/recipes")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty("error", "Database error");
    });
  });

  describe("GET /api/recipes/main-page", () => {
    it("should use default count value when not provided", async () => {
      const res = await request(app)
        .get("/api/recipes/main-page")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
    });

    it("should return recipes from four categories", async () => {
      const res = await request(app)
        .get("/api/recipes/main-page?count=2")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty("breakfast");
      expect(res.body.data).toHaveProperty("miscellaneous");
      expect(res.body.data).toHaveProperty("chicken");
      expect(res.body.data).toHaveProperty("dessert");

      expect(res.body.data.breakfast).toHaveLength(2);
      expect(res.body.data.miscellaneous).toHaveLength(2);
      expect(res.body.data.chicken).toHaveLength(2);
      expect(res.body.data.dessert).toHaveLength(2);
    });

    it("should return 500 if an error occurs", async () => {
      jest.spyOn(Recipe, "aggregate").mockImplementationOnce(() => {
        throw new Error("Database error");
      });
      const res = await request(app)
        .get("/api/recipes/main-page?count=2")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty("error");
    });
  });

  describe("GET /api/recipes/category-list", () => {
    it("should return list of categories", async () => {
      const res = await request(app)
        .get("/api/recipes/category-list")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty("catArr");
      expect(res.body.data.catArr).toBeInstanceOf(Array);
    });

    it("should return 500 if an error occurs", async () => {
      jest.spyOn(Category, "find").mockImplementationOnce(() => {
        throw new Error("Database error");
      });
      const res = await request(app)
        .get("/api/recipes/category-list")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty("error");
    });

    it("should return categories sorted alphabetically", async () => {
      // Dodaj kilka kategorii do bazy danych
      await Category.create([
        {
          title: "Dessert",
          description: "Sweet treats",
          thumb: "dessert_thumb.jpg",
        },
        {
          title: "Breakfast",
          description: "Morning meals",
          thumb: "breakfast_thumb.jpg",
        },
        {
          title: "Miscellaneous",
          description: "Various recipes",
          thumb: "misc_thumb.jpg",
        },
        {
          title: "Chicken",
          description: "Chicken dishes",
          thumb: "chicken_thumb.jpg",
        },
      ]);

      const res = await request(app)
        .get("/api/recipes/category-list")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.catArr).toEqual([
        "Breakfast",
        "Chicken",
        "Dessert",
        "Miscellaneous",
      ]);
    });
  });

  describe("GET /api/recipes/categories/:category", () => {
    it("should return recipes for a specific category", async () => {
      const res = await request(app)
        .get("/api/recipes/categories/Breakfast")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.result).toHaveProperty("length", 2);
      expect(res.body.data.result[0]).toHaveProperty("category", "Breakfast");
    });

    it("should return 404 if no recipes found for the category", async () => {
      const res = await request(app)
        .get("/api/recipes/categories/NonExistentCategory")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty(
        "error",
        "No recipes found for this category"
      );
    });
    it("should return 500 if an error occurs while fetching recipes by category", async () => {
      jest.spyOn(Recipe, "find").mockImplementationOnce(() => {
        throw new Error("Database error");
      });
      const res = await request(app)
        .get("/api/recipes/categories/Breakfast")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty("error");
    });
  });

  describe("GET /api/recipes/:id", () => {
    it("should return a recipe by id", async () => {
      const res = await request(app)
        .get(`/api/recipes/${recipeId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.result).toHaveProperty("_id", recipeId);
    });

    it("should return 404 if recipe not found", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/recipes/${nonExistentId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error", "Recipe not found");
    });

    it("should return 500 if an error occurs while fetching recipe by id", async () => {
      jest.spyOn(Recipe, "findById").mockImplementationOnce(() => {
        throw new Error("Database error");
      });
      const res = await request(app)
        .get(`/api/recipes/${recipeId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty("error");
    });
  });
});
