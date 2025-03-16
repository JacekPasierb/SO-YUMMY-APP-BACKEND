import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import app from "../app";
import { User } from "../models/user";

import jwt from "jsonwebtoken";
import Recipe, { IRecipe } from "../models/recipe";

const API_ROUTES = {
  FAVORITES: "/api/favorite",
  ADD_FAVORITE: (recipeId: string) => `/api/favorite/add/${recipeId}`,
  REMOVE_FAVORITE: (recipeId: string) => `/api/favorite/remove/${recipeId}`,
};

describe("Favorite Recipes API", () => {
  let mongoServer: MongoMemoryServer;
  let userId: string;
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

  beforeEach(async () => {
    jest.restoreAllMocks();
    jest.clearAllMocks();

    // Reset database
    await User.deleteMany({});
    await Recipe.deleteMany({});

    // Create test user and generate token
    const user = await User.create({
      name: "Test User",
      email: "testuser@example.com",
      password: "password123",
      verify: true,
    });
    userId = user._id.toString();
    token = jwt.sign({ id: user._id }, process.env.SECRET as string, {
      expiresIn: "1h",
    });
    user.token = token;
    await user.save();

    // Create a test recipe
    const recipe = await Recipe.create({
      title: "Test Recipe",
      description: "A test recipe",
      category: "Test",
      time: 30,
      instructions: "Test instructions",
      ingredients: [],
      favorites: [],
    }) as IRecipe;
    recipeId = recipe._id.toString();
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  describe("GET /api/favorite/", () => {
    it("should get favorite recipes", async () => {
      const response = await request(app)
        .get(API_ROUTES.FAVORITES)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("data");
      expect(response.body.data).toHaveProperty("favoriteRecipes");
      expect(response.body.data.favoriteRecipes).toBeInstanceOf(Array);
    });

    it("should return error 500 if an error occurs", async () => {
      jest.spyOn(Recipe, "find").mockImplementationOnce(() => {
        throw new Error("Database error");
      });
      const response = await request(app)
        .get(API_ROUTES.FAVORITES)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("Database error");
    });
  });
  describe("POST /api/favorite/:recipeId", () => {
    it("should add a recipe to favorites", async () => {
      jest.spyOn(Recipe, "findByIdAndUpdate").mockResolvedValue(true);

      const response = await request(app)
        .patch(API_ROUTES.ADD_FAVORITE(recipeId))
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
    });

    it("should return 404 if recipe not found", async () => {
      jest.spyOn(Recipe, "findByIdAndUpdate").mockResolvedValue(false);

      const response = await request(app)
        .patch(API_ROUTES.ADD_FAVORITE(recipeId))
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error", "Recipe not found");
    });
    it("should return 500 if an error occurs while adding to favorites", async () => {
      jest
        .spyOn(Recipe, "findByIdAndUpdate")
        .mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .patch(API_ROUTES.ADD_FAVORITE(recipeId))
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("error", "Database error");
    });
  });

  describe("DELETE /api/favorite/remove/:recipeId", () => {
    it("should remove recipe with favorite's recipe", async () => {
      const response = await request(app)
        .delete(API_ROUTES.REMOVE_FAVORITE(recipeId))
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
    });

    it("should return 404 if recipe not found", async () => {
      jest.spyOn(Recipe, "findByIdAndUpdate").mockResolvedValue(false);
      const response = await request(app)
        .delete(API_ROUTES.REMOVE_FAVORITE(recipeId))
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
    });

    it("should return 500 if an error occurs while remove from favorites", async () => {
      jest
        .spyOn(Recipe, "findByIdAndUpdate")
        .mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .delete(API_ROUTES.REMOVE_FAVORITE(recipeId))
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("error", "Database error");
    });
  });
});
