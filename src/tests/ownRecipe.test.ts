import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import app from "../app";
import jwt from "jsonwebtoken";
import { User } from "../models/user";
import Recipe from "../models/recipe";

describe("ownRecipe API", () => {
  let mongoServer: MongoMemoryServer;
  let token: string;
  let userId: string;

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
    await User.deleteMany({});
    await Recipe.deleteMany({});
    // Logowanie użytkownika i generowanie tokena
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
  });

  it("should get own recipes", async () => {
    await Recipe.create({
      title: "Sample Recipe",
      description: "This is a sample recipe",
      owner: userId,
      instructions: "Mix ingredients and cook.",
      category: "Dinner",
      time: "30 minutes",
    });

    const response = await request(app)
      .get(`/api/ownRecipes`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
  });
});
