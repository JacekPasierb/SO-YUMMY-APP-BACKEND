import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import app from "../app";
import Recipe from "../models/recipe";
import { User } from "../models/user";
import jwt from "jsonwebtoken";

describe("PopularRecipe API", () => {
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

    // Create a test recipe
    const recipe = await Recipe.create({
      title: "Test Recipe",
      description: "A test recipe",
      category: "Test",
      time: 30,
      instructions: "Test instructions",
      ingredients: [],
      favorites: [],
    });
    recipeId = recipe._id.toString();
  });

  describe("GET /api/popularRecipes", () => {
    it("should get popular recipe", async () => {
      const response = await request(app)
        .get("/api/popularRecipes")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
    });
    it("should return 500 if an error occurs", async () => {
      jest
        .spyOn(Recipe, "aggregate")
        .mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .get("/api/popularRecipes")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("Error while getting popular recipes: Database error");
    });
  });
});
