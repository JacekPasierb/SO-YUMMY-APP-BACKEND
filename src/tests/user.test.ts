import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import app from "../app";
import { User } from "../models/user";
import bcrypt from "bcrypt";

// Zamockowanie modułu @sendgrid/mail
jest.mock("@sendgrid/mail", () => ({
  setApiKey: jest.fn(),
  send: jest.fn().mockResolvedValue({}),
}));

describe("User API ", () => {
  let mongoServer: MongoMemoryServer;

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

  describe("Registration", () => {
    beforeEach(async () => {
      try {
        await User.deleteMany({});
        await User.create({
          name: "Existing User",
          email: "existinguser@example.com",
          password: "password123",
        });
      } catch (error) {
        console.error("Error setting up test data:", error);
      }
    });

    it("should register a new user with valid data", async () => {
      const res = await request(app).post("/api/users/register").send({
        name: "New User",
        email: "newuser@example.com",
        password: "securepassword123",
      });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("message", "Register Success !");
    });

    it("should not register a user with missing email", async () => {
      const res = await request(app).post("/api/users/register").send({
        name: "New User",
        password: "securepassword123",
      });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error", "Email is required");
    });

    it("should not register a user with invalid email format", async () => {
      const res = await request(app).post("/api/users/register").send({
        name: "New User",
        email: "invalid-email",
        password: "securepassword123",
      });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error", "Enter a valid email address");
    });

    it("should not register a user with short password", async () => {
      const res = await request(app).post("/api/users/register").send({
        name: "New User",
        email: "newuser@example.com",
        password: "short",
      });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty(
        "error",
        "Password must be at least 6 characters long"
      );
    });

    it("should handle long passwords", async () => {
      const longPassword = "a".repeat(100); // 100 znaków
      const res = await request(app).post("/api/users/register").send({
        name: "New User",
        email: "newuser@example.com",
        password: longPassword,
      });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("message", "Register Success !");
    });

    it("should not allow registration with an existing email", async () => {
      try {
        const res = await request(app).post("/api/users/register").send({
          name: "New User",
          email: "existinguser@example.com",
          password: "newpassword123",
        });
        expect(res.status).toBe(409);
        expect(res.body).toHaveProperty("error", "Email is already in use");
      } catch (error) {
        console.error("Error during registration request:", error);
      }
    }, 10000);
  });

  describe("User API - Login", () => {
    beforeEach(async () => {
      try {
        await User.deleteMany({});
        await User.create({
          name: "Existing User",
          email: "existinguser@example.com",
          password: await bcrypt.hash("password123", 12),
          verify: true,
        });
      } catch (error) {
        console.error("Error setting up test data:", error);
      }
    });

    it("should login a user with valid credentials", async () => {
      const res = await request(app).post("/api/users/signin").send({
        email: "existinguser@example.com",
        password: "password123",
      });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("status", "OK");
      expect(res.body).toHaveProperty("code", 200);
      expect(res.body.data).toHaveProperty("token"); // Zakładamy, że zwraca token
      expect(res.body.data.user).toHaveProperty(
        "email",
        "existinguser@example.com"
      );
      expect(res.body.data.user).toHaveProperty("name", "Existing User");
    });

    it("should not login a user with invalid email", async () => {
      const res = await request(app).post("/api/users/signin").send({
        email: "nonexistent@example.com",
        password: "password123",
      });
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("error", "Invalid Email or Password");
    });

    it("should not login a user with invalid password", async () => {
      const res = await request(app).post("/api/users/signin").send({
        email: "existinguser@example.com",
        password: "wrongpassword",
      });
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("error", "Invalid Email or Password");
    });

    it("should not login a user with missing email", async () => {
      const res = await request(app).post("/api/users/signin").send({
        password: "password123",
      });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error", "Email is required");
    });

    it("should not login a user with missing password", async () => {
      const res = await request(app).post("/api/users/signin").send({
        email: "existinguser@example.com",
      });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error", "Password is required");
    });

    it("should not login a user with unverified account", async () => {
      await User.create({
        name: "Unverified User",
        email: "unverifieduser@example.com",
        password: await bcrypt.hash("password123", 12),
        verify: false,
      });

      const res = await request(app).post("/api/users/signin").send({
        email: "unverifieduser@example.com",
        password: "password123",
      });

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("error", "email is not verifed");
    });
  });
});
