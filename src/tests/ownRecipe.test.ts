import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import app from "../app";
import jwt from "jsonwebtoken";
import { User } from "../models/user";
import Recipe from "../models/recipe";

const API_ROUTES = {
  OWN_RECIPES: "/api/ownRecipes",
  ADD_RECIPE: "/api/ownRecipes/add",
  DELETE_RECIPE: (id: string) => `/api/ownRecipes/remove/${id}`,
};

describe("ownRecipe API", () => {
  let mongoServer: MongoMemoryServer;
  let token: string;
  let userId: string;
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

    // Create test recipe
    const recipe = await Recipe.create({
      title: "Sample Recipe",
      description: "This is a sample recipe",
      owner: userId,
      instructions: "Mix ingredients and cook.",
      category: "Dinner",
      time: "30 minutes",
    });

    recipeId = recipe._id.toString();
  });

  describe("GET /api/ownRecipes", () => {
    it("should get own recipes", async () => {
      const response = await request(app)
        .get(API_ROUTES.OWN_RECIPES)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("data");
      expect(response.body.data).toHaveProperty("ownRecipes");
      expect(response.body.data).toHaveProperty("totalOwnRecipes");
      expect(response.body.data.ownRecipes).toBeInstanceOf(Array);
      expect(response.body.data.ownRecipes.length).toBeGreaterThan(0);
      expect(response.body.data.totalOwnRecipes).toBe(
        response.body.data.ownRecipes.length
      );
    });

    it("should return 401 for unauthorized access", async () => {
      const response = await request(app)
        .get(API_ROUTES.OWN_RECIPES)
        .set("Authorization", `Bearer invalidToken`);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error", "Unauthorized");
    });

    it("should return 404 if page number exceeds total pages", async () => {
      const response = await request(app)
        .get(`${API_ROUTES.OWN_RECIPES}?page=2&limit=1`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty(
        "error",
        "Page number exceeds total number of available pages"
      );
    });

    it("should handle error 500 in catch", async () => {
      jest.spyOn(Recipe, "find").mockImplementation(() => {
        throw new Error("Internal Server Error");
      });

      const response = await request(app)
        .get(API_ROUTES.OWN_RECIPES)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("error", "Internal Server Error");
    });

    it("should return 404 when no own recipes are found", async () => {
      await Recipe.deleteMany({ owner: userId });

      const response = await request(app)
        .get(API_ROUTES.OWN_RECIPES)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error", "Not found own recipes");
    });

    it("should return 400 for invalid pagination parameters", async () => {
      const response = await request(app)
        .get(`${API_ROUTES.OWN_RECIPES}?page=abc&limit=xyz`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "error",
        "Invalid pagination parameters"
      );
    });

    it("should return 400 if limit is missing or invalid", async () => {
      const response = await request(app)
        .get(`${API_ROUTES.OWN_RECIPES}?page=1&limit=-10`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "error",
        "Invalid pagination parameters"
      );
    });

    it("should return 400 if page is less than 1", async () => {
      const response = await request(app)
        .get(`${API_ROUTES.OWN_RECIPES}?page=0&limit=10`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "error",
        "Invalid pagination parameters"
      );
    });
  });

  describe("POST /api/ownRecipes/add", () => {
    const newRecipe = {
      title: "New Recipe",
      description: "This is a new recipe",
      instructions: "Mix and cook.",
      category: "Breakfast",
      time: "20 minutes",
    };

    it("should add a new own recipe", async () => {
      const response = await request(app)
        .post(API_ROUTES.ADD_RECIPE)
        .set("Authorization", `Bearer ${token}`)
        .send(newRecipe);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("data");
      expect(response.body.data).toHaveProperty("newRecipe");
    });

    it("should handle error 500 in catch", async () => {
      jest.spyOn(Recipe, "create").mockImplementation(() => {
        throw new Error("Internal Server Error");
      });

      const response = await request(app)
        .post(API_ROUTES.ADD_RECIPE)
        .set("Authorization", `Bearer ${token}`)
        .send(newRecipe);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("error", "Internal Server Error");
    });

    it("should return 401 if user is not authenticated", async () => {
      const response = await request(app)
        .post(API_ROUTES.ADD_RECIPE)
        .send(newRecipe);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error", "Unauthorized");
    });
  });

  describe("DELETE /api/ownRecipes/:recipeId", () => {
    it("should delete an existing recipe", async () => {
      const response = await request(app)
        .delete(API_ROUTES.DELETE_RECIPE(recipeId))
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message", "Recipe deleted");

      const deletedRecipe = await Recipe.findById(recipeId);
      expect(deletedRecipe).toBeNull();
    });

    it("should return 404 if recipe not found", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(API_ROUTES.DELETE_RECIPE(nonExistentId.toString()))
        .set("Authorization", `Bearer ${token}`);
  
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error", "Recipe not found...");
    });

  it("should handle error 500 in catch", async () => {
    jest.spyOn(Recipe, "findByIdAndDelete").mockImplementation(() => {
      throw new Error("Internal Server Error");
    });

    const response = await request(app)
      .delete(API_ROUTES.DELETE_RECIPE(recipeId))
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("error", "Internal Server Error");
  });
  });
});
