"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_memory_server_1 = require("mongodb-memory-server");
const mongoose_1 = __importDefault(require("mongoose"));
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const user_1 = require("../models/user");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mail_1 = __importDefault(require("@sendgrid/mail"));
const emailService_1 = require("../utils/emailService");
const user_2 = require("../services/user");
// Zamockowanie modułu @sendgrid/mail
jest.mock("@sendgrid/mail", () => ({
    setApiKey: jest.fn(),
    send: jest.fn().mockResolvedValue({}),
}));
jest.mock("../services/user", () => (Object.assign(Object.assign({}, jest.requireActual("../services/user")), { addUser: jest.fn(), findUser: jest.fn() })));
jest.mock("../utils/emailService", () => ({
    sendVerificationEmail: jest.fn(),
}));
describe("User API ", () => {
    let mongoServer;
    let userId;
    let token;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        mongoServer = yield mongodb_memory_server_1.MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        mail_1.default.setApiKey("dummy-api-key");
        try {
            yield mongoose_1.default.connect(uri);
        }
        catch (error) {
            console.error("Error connecting to MongoDB:", error);
        }
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield mongoose_1.default.connection.close();
        yield mongoServer.stop();
    }));
    describe("Registration", () => {
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            yield user_1.User.deleteMany({});
        }));
        it("should register a new user with valid data", () => __awaiter(void 0, void 0, void 0, function* () {
            user_2.addUser.mockResolvedValueOnce({
                email: "newuser@example.com",
                password: yield bcrypt_1.default.hash("securepassword123", 12),
                name: "New User",
                verificationToken: "some-token",
                token: null,
            });
            const res = yield (0, supertest_1.default)(app_1.default).post("/api/users/register").send({
                name: "New User",
                email: "newuser@example.com",
                password: "securepassword123",
            });
            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty("message", "Register Success !");
        }));
        it("should not register a user with missing email", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default).post("/api/users/register").send({
                name: "New User",
                password: "securepassword123",
            });
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty("error", "Email is required");
        }));
        it("should not register a user with invalid email format", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default).post("/api/users/register").send({
                name: "New User",
                email: "invalid-email",
                password: "securepassword123",
            });
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty("error", "Enter a valid email address");
        }));
        it("should not register a user if email is not a string", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default).post("/api/users/register").send({
                name: "New User",
                email: 12345,
                password: "securepassword123",
            });
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty("error", "Email must be a string");
        }));
        it("should not register a user with missing password", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default).post("/api/users/register").send({
                name: "New User",
                email: "newuser@example.com",
            });
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty("error", "Password is required");
        }));
        it("should not register a user with short password", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default).post("/api/users/register").send({
                name: "New User",
                email: "newuser@example.com",
                password: "short",
            });
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty("error", "Password must be at least 6 characters long");
        }));
        it("should not allow registration with an existing email", () => __awaiter(void 0, void 0, void 0, function* () {
            user_2.findUser.mockResolvedValueOnce(true);
            yield user_1.User.create({
                name: "Existing User",
                email: "existinguser@example.com",
                password: "password123",
            });
            const res = yield (0, supertest_1.default)(app_1.default).post("/api/users/register").send({
                name: "New User",
                email: "existinguser@example.com",
                password: "newpassword123",
            });
            expect(res.status).toBe(409);
            expect(res.body).toHaveProperty("error", "Email is already in use");
        }));
        it("should return 500 if user creation fails", () => __awaiter(void 0, void 0, void 0, function* () {
            user_2.addUser.mockResolvedValueOnce(null);
            const res = yield (0, supertest_1.default)(app_1.default).post("/api/users/register").send({
                name: "New User",
                email: "newuser@example.com",
                password: "securepassword123",
            });
            expect(res.status).toBe(500);
            expect(res.body).toHaveProperty("error", "Failed to create user");
        }));
        it("should return 500 if verification token generation fails", () => __awaiter(void 0, void 0, void 0, function* () {
            user_2.addUser.mockResolvedValueOnce({
                email: "newuser@example.com",
                password: "hashedpassword",
                name: "New User",
                verificationToken: null,
                token: null,
            });
            const res = yield (0, supertest_1.default)(app_1.default).post("/api/users/register").send({
                name: "New User",
                email: "newuser@example.com",
                password: "securepassword123",
            });
            expect(res.status).toBe(500);
            expect(res.body).toHaveProperty("error", "Verification token generation failed");
        }));
        it("should handle error during sending verification email", () => __awaiter(void 0, void 0, void 0, function* () {
            user_2.findUser.mockResolvedValueOnce(null);
            user_2.addUser.mockResolvedValueOnce({
                email: "newuser@example.com",
                password: "hashedpassword",
                name: "New User",
                verificationToken: "some-token",
                token: null,
            });
            emailService_1.sendVerificationEmail.mockImplementationOnce(() => {
                throw new Error("Email service error");
            });
            const res = yield (0, supertest_1.default)(app_1.default).post("/api/users/register").send({
                name: "New User",
                email: "newuser@example.com",
                password: "securepassword123",
            });
            expect(res.status).toBe(500);
            expect(res.body).toHaveProperty("error", "Email service error");
        }));
    });
    describe("User API - Login", () => {
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            yield user_1.User.deleteMany({});
            const user = yield user_1.User.create({
                name: "Test User",
                email: "testuser@example.com",
                password: yield bcrypt_1.default.hash("password123", 12),
                verify: true,
            });
            userId = user._id.toString();
            token = jsonwebtoken_1.default.sign({ id: userId, email: user.email }, process.env.SECRET, {
                expiresIn: "1h",
            });
            user.token = token;
            yield user.save();
        }));
        it("should login a user with valid credentials", () => __awaiter(void 0, void 0, void 0, function* () {
            user_2.findUser.mockResolvedValueOnce({
                name: "Test User",
                email: "testuser@example.com",
                password: yield bcrypt_1.default.hash("password123", 12),
                verify: true,
            });
            const res = yield (0, supertest_1.default)(app_1.default).post("/api/users/signin").send({
                email: "testuser@example.com",
                password: "password123",
            });
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("status", "OK");
            expect(res.body).toHaveProperty("code", 200);
            expect(res.body.data).toHaveProperty("token");
            expect(res.body.data.user).toHaveProperty("email", "testuser@example.com");
            expect(res.body.data.user).toHaveProperty("name", "Test User");
        }));
        it("should not login a user with invalid email", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default).post("/api/users/signin").send({
                email: "nonexistent@example.com",
                password: "password123",
            });
            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty("error", "Invalid Email or Password");
        }));
        it("should not login a user with invalid password", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default).post("/api/users/signin").send({
                email: "existinguser@example.com",
                password: "wrongpassword",
            });
            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty("error", "Invalid Email or Password");
        }));
        it("should not login a user with missing email", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default).post("/api/users/signin").send({
                password: "password123",
            });
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty("error", "Email is required");
        }));
        it("should not login a user with missing password", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default).post("/api/users/signin").send({
                email: "existinguser@example.com",
            });
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty("error", "Password is required");
        }));
        it("should not login a user with unverified account", () => __awaiter(void 0, void 0, void 0, function* () {
            user_2.findUser.mockResolvedValueOnce({
                name: "Unverified User",
                email: "unverifieduser@example.com",
                password: yield bcrypt_1.default.hash("password123", 12),
                verify: false,
            });
            const res = yield (0, supertest_1.default)(app_1.default).post("/api/users/signin").send({
                email: "unverifieduser@example.com",
                password: "password123",
            });
            expect(res.status).toBe(403);
            expect(res.body).toHaveProperty("error", "email is not verifed");
        }));
    });
    describe("Email Verification", () => {
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            yield user_1.User.deleteMany({});
        }));
        it("should verify a user with a valid verification token", () => __awaiter(void 0, void 0, void 0, function* () {
            const verificationToken = "valid-token";
            yield user_1.User.create({
                name: "User to Verify",
                email: "verifyuser@example.com",
                password: "password123",
                verificationToken,
                verify: false,
            });
            user_2.findUser.mockImplementationOnce((query) => __awaiter(void 0, void 0, void 0, function* () {
                return yield user_1.User.findOne(query);
            }));
            const res = yield (0, supertest_1.default)(app_1.default).get(`/api/users/verify/${verificationToken}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("status", "OK");
            const user = yield user_1.User.findOne({ email: "verifyuser@example.com" });
            expect(user).not.toBeNull();
            expect(user === null || user === void 0 ? void 0 : user.verify).toBe(true);
            expect(user === null || user === void 0 ? void 0 : user.verificationToken).toBeNull();
        }));
        it("should return 404 for an invalid verification token", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default).get(`/api/users/verify/invalid-token`);
            expect(res.status).toBe(404);
        }));
    });
    describe("Resend Verification Email", () => {
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            yield user_1.User.deleteMany({});
        }));
        it("should resend verification email to an unverified user", () => __awaiter(void 0, void 0, void 0, function* () {
            const verificationToken = "valid-token";
            user_2.findUser.mockResolvedValueOnce({
                name: "Unverified User",
                email: "unverifieduser@example.com",
                password: yield bcrypt_1.default.hash("password123", 12),
                verificationToken,
                verify: false,
            });
            const res = yield (0, supertest_1.default)(app_1.default)
                .post("/api/users/resend-verification-email")
                .send({ email: "unverifieduser@example.com" });
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("status", "OK");
            expect(res.body).toHaveProperty("message", "Verification email sent!");
        }));
        it("should not resend verification email to a verified user", () => __awaiter(void 0, void 0, void 0, function* () {
            user_2.findUser.mockResolvedValueOnce({
                name: "Verified User",
                email: "verifieduser@example.com",
                password: yield bcrypt_1.default.hash("password123", 12),
                verify: true,
            });
            const res = yield (0, supertest_1.default)(app_1.default)
                .post("/api/users/resend-verification-email")
                .send({ email: "verifieduser@example.com" });
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty("error", "Email is already verified");
        }));
        it("should return 404 if user is not found", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default)
                .post("/api/users/resend-verification-email")
                .send({ email: "nonexistent@example.com" });
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty("error", "User not found");
        }));
    });
    describe("Current User", () => {
        let userId;
        let token;
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            yield user_1.User.deleteMany({});
            const user = yield user_1.User.create({
                name: "Test User",
                email: "testuser@example.com",
                password: yield bcrypt_1.default.hash("password123", 12),
                verify: true,
            });
            userId = user._id.toString();
            token = jsonwebtoken_1.default.sign({ id: userId, email: user.email }, process.env.SECRET, {
                expiresIn: "1h",
            });
            user.token = token;
            yield user.save();
        }));
        it("should return current user data with valid token", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default)
                .get("/api/users/current")
                .set("Authorization", `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("status", "success");
            expect(res.body.data).toHaveProperty("userId", userId);
            expect(res.body.data).toHaveProperty("email", "testuser@example.com");
            expect(res.body.data).toHaveProperty("name", "Test User");
        }));
        it("should return 401 if token is missing", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default).get("/api/users/current");
            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty("error", "Unauthorized");
        }));
        it("should return 401 if token is invalid", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default)
                .get("/api/users/current")
                .set("Authorization", "Bearer invalidtoken");
            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty("error", "Unauthorized");
        }));
    });
    describe("Logout", () => {
        let userId;
        let token;
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            yield user_1.User.deleteMany({});
            const user = yield user_1.User.create({
                name: "Test User",
                email: "testuser@example.com",
                password: yield bcrypt_1.default.hash("password123", 12),
                verify: true,
            });
            userId = user._id.toString();
            token = jsonwebtoken_1.default.sign({ id: userId, email: user.email }, process.env.SECRET, {
                expiresIn: "1h",
            });
            user.token = token;
            yield user.save();
        }));
        it("should logout a user with a valid token", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default)
                .patch("/api/users/logout")
                .set("Authorization", `Bearer ${token}`);
            expect(res.status).toBe(204);
            const user = yield user_1.User.findById(userId);
            expect(user === null || user === void 0 ? void 0 : user.token).toBeNull();
        }));
        it("should return 401 if token is missing", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default).patch("/api/users/logout");
            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty("error", "Unauthorized");
        }));
        it("should return 401 if token is invalid", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default)
                .patch("/api/users/logout")
                .set("Authorization", "Bearer invalidtoken");
            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty("error", "Unauthorized");
        }));
    });
    describe("Update User", () => {
        let userId;
        let token;
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            yield user_1.User.deleteMany({});
            const user = yield user_1.User.create({
                name: "Test User",
                email: "testuser@example.com",
                password: yield bcrypt_1.default.hash("password123", 12),
                verify: true,
            });
            userId = user._id.toString();
            token = jsonwebtoken_1.default.sign({ id: userId, email: user.email }, process.env.SECRET, {
                expiresIn: "1h",
            });
            user.token = token;
            yield user.save();
        }));
        it("should update user data with valid token and valid data", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default)
                .patch("/api/users/update")
                .set("Authorization", `Bearer ${token}`)
                .send({ name: "Updated User" });
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("status", "User data updated successfully");
            expect(res.body.data.user).toHaveProperty("name", "Updated User");
            const user = yield user_1.User.findById(userId);
            expect(user === null || user === void 0 ? void 0 : user.name).toBe("Updated User");
        }));
        it("should return 400 if name is too short", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default)
                .patch("/api/users/update")
                .set("Authorization", `Bearer ${token}`)
                .send({ name: "Al" });
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty("error", "Name must be at least 3 characters long");
        }));
        it("should return 400 if file type is invalid", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default)
                .patch("/api/users/update")
                .set("Authorization", `Bearer ${token}`)
                .field("name", "Test User")
                .attach("file", "src/tests/files/invalid-file.txt");
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty("error", "Invalid file type. Only JPEG, JPG, and PNG are allowed.");
        }));
        it("should return 400 if file size exceeds limit", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default)
                .patch("/api/users/update")
                .set("Authorization", `Bearer ${token}`)
                .attach("file", "src/tests/files/large-file.jpg");
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty("error", "File too large. Maximum size is 10MB.");
        }));
        it("should return 401 if token is missing for update", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default)
                .patch("/api/users/update")
                .send({ name: "Updated User" });
            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty("error", "Unauthorized");
        }));
        it("should return 401 if token is invalid for update", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default)
                .patch("/api/users/update")
                .set("Authorization", "Bearer invalidtoken")
                .send({ name: "Updated User" });
            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty("error", "Unauthorized");
        }));
    });
    describe("User API - Toggle Theme", () => {
        let token;
        let userId;
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            yield user_1.User.deleteMany({});
            const user = yield user_1.User.create({
                name: "Test User",
                email: "testuser@example.com",
                password: "password123",
                isDarkTheme: false,
                verify: true,
            });
            userId = user._id.toString();
            token = jsonwebtoken_1.default.sign({ id: userId, email: user.email }, process.env.SECRET, {
                expiresIn: "1h",
            });
            user.token = token;
            yield user.save();
        }));
        it("should toggle theme from light to dark", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default)
                .patch("/api/users/toogleTheme")
                .set("Authorization", `Bearer ${token}`)
                .send({ isDarkTheme: true });
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("status", "User data updated successfully");
            expect(res.body.data).toHaveProperty("isDarkTheme", true);
            const user = yield user_1.User.findById(userId);
            expect(user === null || user === void 0 ? void 0 : user.isDarkTheme).toBe(true);
        }));
        it("should toggle theme from dark to light", () => __awaiter(void 0, void 0, void 0, function* () {
            yield user_1.User.findByIdAndUpdate(userId, { isDarkTheme: true });
            const res = yield (0, supertest_1.default)(app_1.default)
                .patch("/api/users/toogleTheme")
                .set("Authorization", `Bearer ${token}`)
                .send({ isDarkTheme: false });
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("status", "User data updated successfully");
            expect(res.body.data).toHaveProperty("isDarkTheme", false);
            const user = yield user_1.User.findById(userId);
            expect(user === null || user === void 0 ? void 0 : user.isDarkTheme).toBe(false);
        }));
        it("should return 401 if token is missing", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default)
                .patch("/api/users/toogleTheme")
                .send({ isDarkTheme: true });
            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty("error", "Unauthorized");
        }));
        it("should return 400 if theme value is invalid", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default)
                .patch("/api/users/toogleTheme")
                .set("Authorization", `Bearer ${token}`)
                .send({ isDarkTheme: "invalid-value" });
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty("error", '"isDarkTheme" must be a boolean');
        }));
    });
});
