import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import app from "../app";
import jwt from "jsonwebtoken";
import { User } from "../models/user";
import Ingredient from "../models/ingredient";

const API_ROUTES = {
  INGREDIENTS: "/api/ingredients",
  ADD_INGREDIENT: "/api/ingredients/add",
  INGREDIENT: (id: string) => `/api/ingredients/${id}`,
};

describe("Ingredients API", () => {
  let mongoServer: MongoMemoryServer;
  let token: string;
  let ingredientId: string;

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

    // Create test user and generate token
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

    const ingredients = await Ingredient.create([
      {
        ttl: "Sugar",
        thb: "thumbnail_url",
        t: "Sugar",
        desc: "Sweet ingredient",
      },
      {
        ttl: "Flour",
        thb: "thumbnail_url",
        t: "Flour",
        desc: "Basic baking ingredient",
      },
      {
        ttl: "Eggs",
        thb: "thumbnail_url",
        t: "Eggs",
        desc: "Protein-rich ingredient",
      },
    ]);
    ingredientId = ingredients[0]._id.toString();
  });

  it("should get all ingredients", async () => {
    const response = await request(app)
      .get(API_ROUTES.INGREDIENTS)
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
  });

  it("should return error 500 if there's an error in getAllIngredients", async () => {
    jest
      .spyOn(Ingredient, "find")
      .mockRejectedValue(new Error("Error fetching ingredients"));

    const response = await request(app)
      .get(API_ROUTES.INGREDIENTS)
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("error", "Error fetching ingredients");
  });

  it("should get ingredient by id", async () => {
    const response = await request(app)
      .get(`/api/ingredients/${ingredientId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
  });

  it("should return error 404 if ingredient not found", async () => {
    jest.spyOn(Ingredient, "findById").mockResolvedValue(null);
    const response = await request(app)
      .get(API_ROUTES.INGREDIENT(ingredientId))
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("error", "Ingredient not found");
  });

  it("should return error 500 if there's an error in getIngredientById", async () => {
    jest
      .spyOn(Ingredient, "findById")
      .mockRejectedValue(new Error("Internal server error"));
    const response = await request(app)
      .get(API_ROUTES.INGREDIENT(ingredientId))
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("error", "Internal server error");
  });
});
