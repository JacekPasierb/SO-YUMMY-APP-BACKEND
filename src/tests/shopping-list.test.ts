import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import app from "../app";
import { User } from "../models/user";
import jwt from "jsonwebtoken";
import Recipe from "../models/recipe";
import ShoppingList from "../models/shoppingList";
import { addIngredientToShoppingList } from "../services/shoppingList";
import * as shoppingListService from "../services/shoppingList";
describe("shopping-list API", () => {
  let mongoServer: MongoMemoryServer;
  let token: string;
  let userId: string;
  let recipeId: string;
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
    await ShoppingList.deleteMany({});
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

    // create a test ShoppingList
    const shoppingList = await ShoppingList.create({
      userId: userId,
      items: [
        {
          ingredientId: new mongoose.Types.ObjectId(),
          name: "Test Ingredient",
          measure: "grams",
          recipeId: recipeId,
        },
      ],
    });
    ingredientId = shoppingList.items[0].ingredientId.toString();
  });

  describe("GET /api/shopping-list", () => {
    it("should get shopping list", async () => {
      const response = await request(app)
        .get("/api/shopping-list")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
    });

    it("should return 404 if shopping list not found", async () => {
      jest
        .spyOn(shoppingListService, "getShoppingListByUserId")
        .mockResolvedValue(null);

      const response = await request(app)
        .get("/api/shopping-list")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error", "Shopping list not found");
    });

    it("should return 500 if an error occurs", async () => {
      jest
        .spyOn(shoppingListService, "getShoppingListByUserId")
        .mockImplementationOnce(() => {
          throw new Error("Database error");
        });

      const response = await request(app)
        .get("/api/shopping-list")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty(
        "error",
        "Internal server error: Database error"
      );
    });
  });

  describe("POST /api/shopping-list/add", () => {
    const newItem = {
      ingredientId: new mongoose.Types.ObjectId(),
      name: "New Ingredient",
      measure: "liters",
      recipeId: recipeId,
    };

    it("should add an item to the shopping list", async () => {
      const response = await request(app)
        .post("/api/shopping-list/add")
        .set("Authorization", `Bearer ${token}`)
        .send(newItem);

      expect(response.status).toBe(201);
    });

    it("should return 500 if an error occurs in catch", async () => {
      jest
        .spyOn(shoppingListService, "addIngredientToShoppingList")
        .mockImplementationOnce(() => {
          throw new Error("Database error");
        });

      const response = await request(app)
        .post("/api/shopping-list/add")
        .set("Authorization", `Bearer ${token}`)
        .send(newItem);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty(
        "error",
        "Error adding ingredient to shopping list: Database error"
      );
    });
  });

  describe("DELETE /api/shopping-list/remove", () => {
    it("should remove an item from the shopping list", async () => {
      const response = await request(app)
        .delete(`/api/shopping-list/remove`)
        .set("Authorization", `Bearer ${token}`)
        .send({ ingredientId, recipeId: null });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        "message",
        "Item removed successfully"
      );
    });
  it("should return 500 if an error occurs in catch", async () => {
    jest
      .spyOn(shoppingListService, "deleteIngredientFromShoppingList")
      .mockImplementationOnce(() => {
        throw new Error("Database error");
      });

    const response = await request(app)
      .delete(`/api/shopping-list/remove`)
      .set("Authorization", `Bearer ${token}`)
      .send({ ingredientId, recipeId: null });

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty(
      "error",
      "Error removing ingredient from shopping list: Database error"
    );
  });
  });
});
