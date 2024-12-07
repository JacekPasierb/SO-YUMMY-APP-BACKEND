import request from "supertest";
import app from "../app";
import { User } from "../models/user";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { sendSubscriptionEmail } from "../utils/emailService";
import { createSubscribe, findSubscribe } from "../services/subscribeServices";

// Mockowanie funkcji sendSubscriptionEmail
jest.mock("../utils/emailService", () => ({
  sendSubscriptionEmail: jest.fn().mockResolvedValue({}),
}));

jest.mock("../services/subscribeServices", () => ({
  ...jest.requireActual("../services/subscribeServices"),
  findSubscribe: jest.fn(),
  createSubscribe: jest.fn().mockResolvedValue({
    _id: "mockedId",
    email: "subscriber@example.com",
    owner: "mockedOwnerId",
  }),
}));

describe("Subscribe API", () => {
  let mongoServer: MongoMemoryServer;
  let userId: string;
  let token: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    jest.clearAllMocks(); 

    await mongoose.connection.db.dropDatabase();

    const user = await User.create({
      name: "Test User",
      email: "testuser@example.com",
      password: await bcrypt.hash("password123", 12),
      verify: true,
    });

    userId = user._id.toString();
    token = jwt.sign(
      { id: userId, email: user.email },
      process.env.SECRET as string,
      {
        expiresIn: "1h",
      }
    );
    user.token = token;
    await user.save();
  });

  it("should subscribe a user with valid email", async () => {
    (findSubscribe as jest.Mock).mockResolvedValueOnce(null);
    const res = await request(app)
      .post("/api/subscribe")
      .set("Authorization", `Bearer ${token}`)
      .send({ email: "subscriber@example.com" });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("message", "Subscription successful");
    expect(sendSubscriptionEmail).toHaveBeenCalled();
  });

  it("should return 401 if user is not authenticated", async () => {
    const res = await request(app)
      .post("/api/subscribe")
      .send({ email: "subscriber@example.com" });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error", "Unauthorized");
  });

  it("should return 409 if user is already subscribed", async () => {
    (findSubscribe as jest.Mock).mockImplementationOnce(async (query) => {
      if (query.owner) {
        return {
          _id: "mockedId",
          email: "subscriber@example.com",
          owner: userId,
        };
      }
      return null;
    });

    const res = await request(app)
      .post("/api/subscribe")
      .set("Authorization", `Bearer ${token}`)
      .send({ email: "subscriber@example.com" });

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty("error", "User is already subscribed");
  });

  it("should return 409 if email belongs to another user", async () => {
    (findSubscribe as jest.Mock).mockImplementation(async (query) => {
      if (query.owner) {
        return false;
      }
      if (query.email) {
        return true;
      }
      return null;
    });

    const res = await request(app)
      .post("/api/subscribe")
      .set("Authorization", `Bearer ${token}`)
      .send({ email: "usertwo@example.com" });

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty(
      "error",
      "The email belongs to another user"
    );
  });

  it("should handle errors during subscription creation", async () => {
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

    const res = await request(app)
      .post("/api/subscribe")
      .set("Authorization", `Bearer ${token}`)
      .send({ email: "test@example.com" });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("error", "Internal Server Error");
  });
});
