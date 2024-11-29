import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import app from "../app";
import { User } from "../models/user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sgMail from '@sendgrid/mail';
import { sendVerificationEmail } from '../utils/emailService';

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
  describe("Email Sending", () => {
    it("should call setApiKey", () => {
      expect(sgMail.setApiKey).toHaveBeenCalled();
    });

    it("should call send function when sending verification email", async () => {
      const emailToSend = { to: 'test@example.com', verificationToken: '12345' };
      await sendVerificationEmail(emailToSend);
      expect(sgMail.send).toHaveBeenCalledWith(expect.objectContaining({
        to: 'test@example.com',
      }));
    });
  });

  describe("Registration", () => {
    beforeEach(async () => {
      await User.deleteMany({});
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
      await User.create({
        name: "Existing User",
        email: "existinguser@example.com",
        password: "password123",
      });

      const res = await request(app).post("/api/users/register").send({
        name: "New User",
        email: "existinguser@example.com",
        password: "newpassword123",
      });
      expect(res.status).toBe(409);
      expect(res.body).toHaveProperty("error", "Email is already in use");
    });
  });

  describe("User API - Login", () => {
    beforeEach(async () => {
      await User.deleteMany({});
      await User.create({
        name: "Existing User",
        email: "existinguser@example.com",
        password: await bcrypt.hash("password123", 12),
        verify: true,
      });
    });

    it("should login a user with valid credentials", async () => {
      const res = await request(app).post("/api/users/signin").send({
        email: "existinguser@example.com",
        password: "password123",
      });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("status", "OK");
      expect(res.body).toHaveProperty("code", 200);
      expect(res.body.data).toHaveProperty("token");
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

  describe("Email Verification", () => {
    beforeEach(async () => {
      await User.deleteMany({});
    });

    it("should verify a user with a valid verification token", async () => {
      const verificationToken = "valid-token";
      await User.create({
        name: "User to Verify",
        email: "verifyuser@example.com",
        password: "password123",
        verificationToken,
        verify: false,
      });

      const res = await request(app).get(
        `/api/users/verify/${verificationToken}`
      );
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("status", "OK");

      const user = await User.findOne({ email: "verifyuser@example.com" });
      expect(user).not.toBeNull();
      expect(user?.verify).toBe(true);
      expect(user?.verificationToken).toBeNull();
    });

    it("should return 404 for an invalid verification token", async () => {
      const res = await request(app).get(`/api/users/verify/invalid-token`);
      expect(res.status).toBe(404);
    });
  });

  describe("Resend Verification Email", () => {
    beforeEach(async () => {
      await User.deleteMany({});
    });

    it("should resend verification email to an unverified user", async () => {
      const verificationToken = "valid-token";
      await User.create({
        name: "Unverified User",
        email: "unverifieduser@example.com",
        password: await bcrypt.hash("password123", 12),
        verificationToken,
        verify: false,
      });

      const res = await request(app)
        .post("/api/users/resend-verification-email")
        .send({ email: "unverifieduser@example.com" });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("status", "OK");
      expect(res.body).toHaveProperty("message", "Verification email sent!");
    });

    it("should not resend verification email to a verified user", async () => {
      await User.create({
        name: "Verified User",
        email: "verifieduser@example.com",
        password: await bcrypt.hash("password123", 12),
        verify: true,
      });

      const res = await request(app)
        .post("/api/users/resend-verification-email")
        .send({ email: "verifieduser@example.com" });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error", "Email is already verified");
    });

    it("should return 404 if user is not found", async () => {
      const res = await request(app)
        .post("/api/users/resend-verification-email")
        .send({ email: "nonexistent@example.com" });

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error", "User not found");
    });
  });

  describe("Current User", () => {
    let userId: string;
    let token: string;
    beforeEach(async () => {
      await User.deleteMany({});
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
    it("should return current user data with valid token", async () => {
      const res = await request(app)
        .get("/api/users/current")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("status", "success");
      expect(res.body.data).toHaveProperty("userId", userId);
      expect(res.body.data).toHaveProperty("email", "testuser@example.com");
      expect(res.body.data).toHaveProperty("name", "Test User");
    });

    it("should return 401 if token is missing", async () => {
      const res = await request(app).get("/api/users/current");

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("error", "Unauthorized");
    });

    it("should return 401 if token is invalid", async () => {
      const res = await request(app)
        .get("/api/users/current")
        .set("Authorization", "Bearer invalidtoken");

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("error", "Unauthorized");
    });
  });

  describe("Logout", () => {
    let userId: string;
    let token: string;

    beforeEach(async () => {
      await User.deleteMany({});
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

    it("should logout a user with a valid token", async () => {
      const res = await request(app)
        .patch("/api/users/logout")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(204);

      const user = await User.findById(userId);
      expect(user?.token).toBeNull();
    });

    it("should return 401 if token is missing", async () => {
      const res = await request(app).patch("/api/users/logout");

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("error", "Unauthorized");
    });

    it("should return 401 if token is invalid", async () => {
      const res = await request(app)
        .patch("/api/users/logout")
        .set("Authorization", "Bearer invalidtoken");

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("error", "Unauthorized");
    });
  });

  describe("Update User", () => {
    let userId: string;
    let token: string;

    beforeEach(async () => {
      await User.deleteMany({});
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

    it("should update user data with valid token and valid data", async () => {
      const res = await request(app)
        .patch("/api/users/update")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Updated User" });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty(
        "status",
        "User data updated successfully"
      );
      expect(res.body.data.user).toHaveProperty("name", "Updated User");

      const user = await User.findById(userId);
      expect(user?.name).toBe("Updated User");
    });

    it("should return 400 if name is too short", async () => {
      const res = await request(app)
        .patch("/api/users/update")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Al" });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty(
        "error",
        "Name must be at least 3 characters long"
      );
    });

    it("should return 400 if file type is invalid", async () => {
      const res = await request(app)
        .patch("/api/users/update")
        .set("Authorization", `Bearer ${token}`)
        .field("name", "Test User")
        .attach("file", "src/tests/files/invalid-file.txt");

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty(
        "error",
        "Invalid file type. Only JPEG, JPG, and PNG are allowed."
      );
    });

    it("should return 400 if file size exceeds limit", async () => {
      const res = await request(app)
        .patch("/api/users/update")
        .set("Authorization", `Bearer ${token}`)
        .attach("file", "src/tests/files/large-file.jpg"); 

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error", "File too large. Maximum size is 10MB.");
    });

    // it("should return 401 if token is missing for update", async () => {
    //   const res = await request(app).patch("/api/users/update").send({ name: "Updated User" });

    //   expect(res.status).toBe(401);
    //   expect(res.body).toHaveProperty("error", "Unauthorized");
    // });

    // it("should return 401 if token is invalid for update", async () => {
    //   const res = await request(app)
    //     .patch("/api/users/update")
    //     .set("Authorization", "Bearer invalidtoken")
    //     .send({ name: "Updated User" });

    //   expect(res.status).toBe(401);
    //   expect(res.body).toHaveProperty("error", "Unauthorized");
    // });
  });
});
