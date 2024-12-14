import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import app from "../app";
import jwt from "jsonwebtoken";
import { User } from "../models/user";
import { findSubscribe, createSubscribe } from "../services/subscribeServices";
import { sendSubscriptionEmail } from "../utils/emailService";

jest.mock("../services/subscribeServices");
jest.mock("../utils/emailService", () => ({
  sendSubscriptionEmail: jest.fn().mockResolvedValue({}),
}));

const API_ROUTES = {
  SUBSCRIBE: "/api/subscribe",
};

describe("Subscribe API", () => {
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
    userId = user._id.toString();
    token = jwt.sign({ id: userId }, process.env.SECRET as string, {
      expiresIn: "1h",
    });
    user.token = token;
    await user.save();
  });

  describe("POST /api/subscribe", () => {
    const validEmail = "subscriber@example.com";

    it("should subscribe a user with a valid email", async () => {
      (findSubscribe as jest.Mock).mockResolvedValueOnce(false);
      (createSubscribe as jest.Mock).mockResolvedValueOnce({
        _id: "mockedId",
        email: validEmail,
        owner: userId,
      });

      const response = await request(app)
        .post(API_ROUTES.SUBSCRIBE)
        .set("Authorization", `Bearer ${token}`)
        .send({ email: validEmail });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty(
        "message",
        "Subscription successful"
      );
      expect(sendSubscriptionEmail).toHaveBeenCalledWith({
        to: validEmail,
        subject: "SO YUMMY APP subscription",
        html: expect.any(String),
      });
    });

    it("should return 401 for unauthorized access", async () => {
      const response = await request(app)
        .post(API_ROUTES.SUBSCRIBE)
        .send({ email: validEmail });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error", "Unauthorized");
    });

    it("should return 409 if the user is already subscribed", async () => {
      (findSubscribe as jest.Mock).mockResolvedValueOnce({
        _id: "mockedId",
        email: validEmail,
        owner: userId,
      });

      const response = await request(app)
        .post(API_ROUTES.SUBSCRIBE)
        .set("Authorization", `Bearer ${token}`)
        .send({ email: validEmail });

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty(
        "error",
        "User is already subscribed"
      );
    });

    it("should return 409 if the email belongs to another user", async () => {
      (findSubscribe as jest.Mock).mockImplementation((query) => {
        if (query.email === validEmail) {
          return { _id: "mockedId", email: validEmail, owner: "otherUserId" };
        }
        return null;
      });

      const response = await request(app)
        .post(API_ROUTES.SUBSCRIBE)
        .set("Authorization", `Bearer ${token}`)
        .send({ email: validEmail });

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty(
        "error",
        "The email belongs to another user"
      );
    });

    it("should handle server errors during subscription creation", async () => {
      (findSubscribe as jest.Mock).mockImplementation(async (query) => {
        if (query.owner) {
          return false;
        }
        if (query.email) {
          return false;
        }
        return false;
      });

      (createSubscribe as jest.Mock).mockRejectedValueOnce(
        new Error("Internal Server Error")
      );

      const response = await request(app)
        .post(API_ROUTES.SUBSCRIBE)
        .set("Authorization", `Bearer ${token}`)
        .send({ email: validEmail });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("error", "Internal Server Error");
    });

    it("should return 400 if email is missing", async () => {
      const response = await request(app)
        .post(API_ROUTES.SUBSCRIBE)
        .set("Authorization", `Bearer ${token}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error", "Email is required");
    });

    it("should return 400 if email format is invalid", async () => {
      const response = await request(app)
        .post(API_ROUTES.SUBSCRIBE)
        .set("Authorization", `Bearer ${token}`)
        .send({ email: "invalid-email" });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error", "Invalid email format");
    });
  });
});
