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

    await Recipe.create({
      title: "Sample Recipe",
      description: "This is a sample recipe",
      owner: userId,
      instructions: "Mix ingredients and cook.",
      category: "Dinner",
      time: "30 minutes",
    });
  });

  describe("GET /api/ownRecipes", () => {
    it("should get own recipes", async () => {
      const response = await request(app)
        .get(`/api/ownRecipes`)
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

    it("should handle error 500 in catch", async () => {
      jest.spyOn(Recipe, "find").mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest
            .fn()
            .mockRejectedValue(new Error("Internal Server Error")),
        }),
      } as any);

      const response = await request(app)
        .get(`/api/ownRecipes`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("Internal Server Error");
    });

    it("should return 404 when no own recipes are found", async () => {
      await Recipe.deleteMany({ owner: userId });

      const response = await request(app)
        .get(`/api/ownRecipes`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("Not found own recipes");
    });
  });

  describe("POST /api/ownRecipes/add", () => {
    it("should add a new own recipe", async () => {
      const newRecipe = {
        title: "New Recipe",
        description: "This is a new recipe",
       
        instructions: "Mix and cook.",
        category: "Breakfast",
        time: "20 minutes",
      };

      const response = await request(app)
        .post(`/api/ownRecipes/add`)
        .set("Authorization", `Bearer ${token}`)
        .send(newRecipe);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("data");
      expect(response.body.data).toHaveProperty("newRecipe");
    });

    // it("should handle error 500 in catch", async () => {
    //   jest.spyOn(Recipe, 'create').mockRejectedValue(new Error("Internal Server Error"));

    //   const response = await request(app)
    //     .post(`/api/ownRecipes/add`)
    //     .set("Authorization", `Bearer ${token}`)
    //     .send({});

    //   expect(response.status).toBe(500);
    //   expect(response.body).toHaveProperty("error");
    //   expect(response.body.error).toBe("Internal Server Error");
    // });

    // it("should return 401 when unauthorized", async () => {
    //   const response = await request(app)
    //     .post(`/api/ownRecipes/add`)
    //     .send({});

    //   expect(response.status).toBe(401);
    //   expect(response.body).toHaveProperty("error");
    //   expect(response.body.error).toBe("Unauthorized");
    // });
  });
});
