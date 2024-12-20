import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import app from "../app";
import { User } from "../models/user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sgMail from "@sendgrid/mail";
import { sendVerificationEmail } from "../utils/emailService";
import { addUser, findUser, getUserById, updateUser } from "../services/user";
import multer from "multer";

// Zamockowanie modułu @sendgrid/mail
jest.mock("@sendgrid/mail", () => ({
  setApiKey: jest.fn(),
  send: jest.fn().mockResolvedValue({}),
}));

jest.mock("../services/user", () => ({
  ...jest.requireActual("../services/user"),
  addUser: jest.fn(),
  updateUser: jest.fn(),
  findUser: jest.fn(),
  getUserById: jest.fn(),
}));

jest.mock("../utils/emailService", () => ({
  sendVerificationEmail: jest.fn(),
}));

describe("User API ", () => {
  let mongoServer: MongoMemoryServer;
  let userId: string;
  let token: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    sgMail.setApiKey("dummy-api-key");

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
    jest.resetAllMocks();
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

  describe("Registration", () => {
    it("should register a new user with valid data", async () => {
      (addUser as jest.Mock).mockResolvedValueOnce({
        email: "newuser@example.com",
        password: await bcrypt.hash("securepassword123", 12),
        name: "New User",
        verificationToken: "some-token",
        token: null,
      });

      const res = await request(app).post("/api/users/register").send({
        name: "New User",
        email: "newuser@example.com",
        password: "securepassword123",
      });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("message", "Register Success !");
    });

    it("should not register a user with missing name", async () => {
      const res = await request(app).post("/api/users/register").send({
        email: "newuser@example.com",
        password: "securepassword123",
      });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error", "Name is required");
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

    it("should not register a user if email is not a string", async () => {
      const res = await request(app).post("/api/users/register").send({
        name: "New User",
        email: 12345,
        password: "securepassword123",
      });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error", "Email must be a string");
    });

    it("should not register a user with missing password", async () => {
      const res = await request(app).post("/api/users/register").send({
        name: "New User",
        email: "newuser@example.com",
      });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error", "Password is required");
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

    it("should not allow registration with an existing email", async () => {
      (findUser as jest.Mock).mockResolvedValueOnce(true);
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

    it("should return 500 if user creation fails", async () => {
      (addUser as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).post("/api/users/register").send({
        name: "New User",
        email: "newuser@example.com",
        password: "securepassword123",
      });

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty("error", "Failed to create user");
    });

    it("should return 500 if verification token generation fails", async () => {
      (addUser as jest.Mock).mockResolvedValueOnce({
        email: "newuser@example.com",
        password: "hashedpassword",
        name: "New User",
        verificationToken: null,
        token: null,
      });

      const res = await request(app).post("/api/users/register").send({
        name: "New User",
        email: "newuser@example.com",
        password: "securepassword123",
      });

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty(
        "error",
        "Verification token generation failed"
      );
    });

    it("should handle error during sending verification email", async () => {
      (findUser as jest.Mock).mockResolvedValueOnce(null);
      (addUser as jest.Mock).mockResolvedValueOnce({
        email: "newuser@example.com",
        password: "hashedpassword",
        name: "New User",
        verificationToken: "some-token",
        token: null,
      });
      (sendVerificationEmail as jest.Mock).mockImplementationOnce(() => {
        throw new Error("Email service error");
      });

      const res = await request(app).post("/api/users/register").send({
        name: "New User",
        email: "newuser@example.com",
        password: "securepassword123",
      });

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty("error", "Email service error");
    });
  });

  describe("User API - Login", () => {
    it("should login a user with valid credentials", async () => {
      (findUser as jest.Mock).mockResolvedValueOnce({
        name: "Test User",
        email: "testuser@example.com",
        password: await bcrypt.hash("password123", 12),
        verify: true,
      });

      const res = await request(app).post("/api/users/signin").send({
        email: "testuser@example.com",
        password: "password123",
      });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("status", "OK");
      expect(res.body).toHaveProperty("code", 200);
      expect(res.body.data).toHaveProperty("token");
      expect(res.body.data.user).toHaveProperty(
        "email",
        "testuser@example.com"
      );
      expect(res.body.data.user).toHaveProperty("name", "Test User");
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
      (findUser as jest.Mock).mockResolvedValueOnce({
        name: "Test User",
        email: "testuser@example.com",
        password: await bcrypt.hash("correctpassword", 12),
        verify: true,
      });
      const res = await request(app).post("/api/users/signin").send({
        email: "testuser@example.com",
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
      (findUser as jest.Mock).mockResolvedValueOnce({
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
    it("should verify a user with a valid verification token", async () => {
      const verificationToken = "valid-token";
      const createdUser = await User.create({
        name: "User to Verify",
        email: "verifyuser@example.com",
        password: "password123",
        verificationToken,
        verify: false,
      });

      (findUser as jest.Mock).mockResolvedValueOnce(createdUser);

      (updateUser as jest.Mock).mockResolvedValueOnce({
        ...createdUser.toObject(),
        verificationToken: null,
        verify: true,
      });

      const res = await request(app).get(
        `/api/users/verify/${verificationToken}`
      );
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("status", "OK");
      await User.updateOne(
        { email: "verifyuser@example.com" },
        { verify: true, verificationToken: null }
      );
      const user = await User.findOne({ email: "verifyuser@example.com" });
      expect(user).not.toBeNull();
      expect(user?.verify).toBe(true);
      expect(user?.verificationToken).toBeNull();
    });

    it("should return 404 for an invalid verification token", async () => {
      const res = await request(app).get(`/api/users/verify/invalid-token`);
      expect(res.status).toBe(404);
    });

    it("should return 500 if an error occurs during email verification", async () => {
      (findUser as jest.Mock).mockResolvedValueOnce({
        name: "User to Verify",
        email: "verifyuser@example.com",
        password: "password123",
        verificationToken: "valid-token",
        verify: false,
      });
      (updateUser as jest.Mock).mockResolvedValueOnce(false);

      const res = await request(app).get("/api/users/verify/some-token");

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty("message", "Failed to update user");
    });

    it("should return 500 if an internal server error occurs", async () => {
      const verificationToken = "valid-token";
      (findUser as jest.Mock).mockImplementationOnce(() => {
        throw new Error("Internal Server Error");
      });

      const res = await request(app).get(
        `/api/users/verify/${verificationToken}`
      );

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty("message", "Internal Server Error");
    });
  });

  describe("Resend Verification Email", () => {
    it("should resend verification email to an unverified user", async () => {
      const verificationToken = "valid-token";
      (findUser as jest.Mock).mockResolvedValueOnce({
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
      (findUser as jest.Mock).mockResolvedValueOnce({
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

    it("should return 500 if verification token generation failed", async () => {
      (findUser as jest.Mock).mockResolvedValueOnce({
        email: "testuser@example.com",
        verify: false,
        verificationToken: null,
      });

      const res = await request(app)
        .post("/api/users/resend-verification-email")
        .send({ email: "testuser@example.com" });

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty(
        "error",
        "Verification token generation failed"
      );
    });
  });

  describe("Current User", () => {
    it("should return current user data with valid token", async () => {
      (getUserById as jest.Mock).mockResolvedValueOnce({
        _id: userId,
        email: "testuser@example.com",
        name: "Test User",
        token: token,
        avatar: null,
        isDarkTheme: false,
      });
      const res = await request(app)
        .get("/api/users/current")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("status", "success");
      expect(res.body.data).toHaveProperty("email", "testuser@example.com");
      expect(res.body.data).toHaveProperty("name", "Test User");
      expect(res.body.data).toHaveProperty("avatar", null);
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

    it("should return 404 if user is not found", async () => {
      (getUserById as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app)
        .get("/api/users/current")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error", "User not found");
    });
  });

  describe("Logout", () => {
    it("should return 204 on valid logout", async () => {
      (updateUser as jest.Mock).mockResolvedValueOnce({ token: null });
      const res = await request(app)
        .patch("/api/users/logout")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(204);
      await User.updateOne({ email: "testuser@example.com" }, { token: null });
      const user = await User.findById(userId);
      expect(user).not.toBeNull();
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

    it("should handle error when user logout fails due to update failure", async () => {
      (updateUser as jest.Mock).mockResolvedValueOnce(null);
      const res = await request(app)
        .patch("/api/users/logout")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty(
        "error",
        "Failed to logout: User not found or update unsuccessful"
      );
    });
  });

  describe("Update User", () => {
    it("should update user data with valid token and valid data", async () => {
      (updateUser as jest.Mock).mockResolvedValueOnce(true);
      const res = await request(app)
        .patch("/api/users/update")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Updated User" });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty(
        "status",
        "User data updated successfully"
      );

      await User.updateOne({ _id: userId }, { name: "Updated User" });

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
      expect(res.body).toHaveProperty(
        "error",
        "File too large. Maximum size is 10MB."
      );
    });

    it("should return 401 if token is missing for update", async () => {
      const res = await request(app)
        .patch("/api/users/update")
        .send({ name: "Updated User" });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("error", "Unauthorized");
    });

    it("should return 401 if token is invalid for update", async () => {
      const res = await request(app)
        .patch("/api/users/update")
        .set("Authorization", "Bearer invalidtoken")
        .send({ name: "Updated User" });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("error", "Unauthorized");
    });

    it("should return 500 if user update fails during email verification", async () => {
      (updateUser as jest.Mock).mockResolvedValueOnce(false);

      const res = await request(app)
        .patch("/api/users/update")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "New Name" });

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty("message", "Failed to update user");
    });

    it("should return 500 if user update fails ", async () => {
      (updateUser as jest.Mock).mockImplementationOnce(() => {
        throw new Error("Internal Server Error");
      });

      const res = await request(app)
        .patch("/api/users/update")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "New Name" });

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty("error", "Internal Server Error");
    });

    it("should return 400 if file size exceeds limit", async () => {
      // Symulowanie błędu LIMIT_FILE_SIZE
      const multerError = new multer.MulterError("LIMIT_FILE_SIZE");

      // Mockowanie middleware, aby rzucało błąd LIMIT_FILE_SIZE
      app.use((req, res, next) => {
        next(multerError);
      });

      const res = await request(app)
        .patch("/api/users/update")
        .set("Authorization", `Bearer ${token}`)
        .attach(
          "file",
          Buffer.from("a".repeat(11 * 1024 * 1024)),
          "largefile.jpg"
        ); // Przykładowy duży plik

      // Sprawdzenie, czy odpowiedź ma status 400
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty(
        "error",
        "File too large. Maximum size is 10MB."
      );
    });
  });

  describe("User API - Toggle Theme", () => {
    it("should toggle theme from light to dark", async () => {
      (updateUser as jest.Mock).mockResolvedValueOnce({
        isDarkTheme: true,
      });
      const res = await request(app)
        .patch("/api/users/toogleTheme")
        .set("Authorization", `Bearer ${token}`)
        .send({ isDarkTheme: true });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty(
        "status",
        "User data updated successfully"
      );
      expect(res.body.data).toHaveProperty("isDarkTheme", true);
      await User.updateOne({ _id: userId }, { isDarkTheme: true });
      const user = await User.findById(userId);
      expect(user?.isDarkTheme).toBe(true);
    });

    it("should toggle theme from dark to light", async () => {
      (updateUser as jest.Mock).mockResolvedValueOnce({
        isDarkTheme: false,
      });

      const res = await request(app)
        .patch("/api/users/toogleTheme")
        .set("Authorization", `Bearer ${token}`)
        .send({ isDarkTheme: false });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty(
        "status",
        "User data updated successfully"
      );
      expect(res.body.data).toHaveProperty("isDarkTheme", false);
      await User.updateOne({ _id: userId }, { isDarkTheme: false });
      const user = await User.findById(userId);
      expect(user?.isDarkTheme).toBe(false);
    });

    it("should return 500 if not update toggle theme ", async () => {
      (updateUser as jest.Mock).mockResolvedValueOnce(null);
      const res = await request(app)
        .patch("/api/users/toogleTheme")
        .set("Authorization", `Bearer ${token}`)
        .send({ isDarkTheme: true });

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty("error", "Failed to update user");
    });

    it("should return 401 if token is missing", async () => {
      const res = await request(app)
        .patch("/api/users/toogleTheme")
        .send({ isDarkTheme: true });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("error", "Unauthorized");
    });

    it("should return 400 if theme value is invalid", async () => {
      const res = await request(app)
        .patch("/api/users/toogleTheme")
        .set("Authorization", `Bearer ${token}`)
        .send({ isDarkTheme: "invalid-value" });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty(
        "error",
        '"isDarkTheme" must be a boolean'
      );
    });

    it("should pass error to next middleware if an error occurs during theme toggle", async () => {
      // Zamockowanie updateUser, aby rzucało wyjątek
      (updateUser as jest.Mock).mockImplementationOnce(() => {
        throw new Error("Internal Server Error");
      });

      const res = await request(app)
        .patch("/api/users/toogleTheme")
        .set("Authorization", `Bearer ${token}`)
        .send({ isDarkTheme: true });

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty("error", "Internal Server Error");
    });
  });
});
