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
// Zamockowanie modułu @sendgrid/mail
jest.mock("@sendgrid/mail", () => ({
    setApiKey: jest.fn(),
    send: jest.fn().mockResolvedValue({}),
}));
describe("User API ", () => {
    let mongoServer;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        mongoServer = yield mongodb_memory_server_1.MongoMemoryServer.create();
        const uri = mongoServer.getUri();
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
            try {
                yield user_1.User.deleteMany({});
                yield user_1.User.create({
                    name: "Existing User",
                    email: "existinguser@example.com",
                    password: "password123",
                });
            }
            catch (error) {
                console.error("Error setting up test data:", error);
            }
        }));
        it("should register a new user with valid data", () => __awaiter(void 0, void 0, void 0, function* () {
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
        it("should not register a user with short password", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default).post("/api/users/register").send({
                name: "New User",
                email: "newuser@example.com",
                password: "short",
            });
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty("error", "Password must be at least 6 characters long");
        }));
        it("should handle long passwords", () => __awaiter(void 0, void 0, void 0, function* () {
            const longPassword = "a".repeat(100); // 100 znaków
            const res = yield (0, supertest_1.default)(app_1.default).post("/api/users/register").send({
                name: "New User",
                email: "newuser@example.com",
                password: longPassword,
            });
            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty("message", "Register Success !");
        }));
        it("should not allow registration with an existing email", () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const res = yield (0, supertest_1.default)(app_1.default).post("/api/users/register").send({
                    name: "New User",
                    email: "existinguser@example.com",
                    password: "newpassword123",
                });
                expect(res.status).toBe(409);
                expect(res.body).toHaveProperty("error", "Email is already in use");
            }
            catch (error) {
                console.error("Error during registration request:", error);
            }
        }), 10000);
    });
    describe("User API - Login", () => {
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            try {
                yield user_1.User.deleteMany({});
                yield user_1.User.create({
                    name: "Existing User",
                    email: "existinguser@example.com",
                    password: yield bcrypt_1.default.hash("password123", 12),
                    verify: true,
                });
            }
            catch (error) {
                console.error("Error setting up test data:", error);
            }
        }));
        it("should login a user with valid credentials", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default).post("/api/users/signin").send({
                email: "existinguser@example.com",
                password: "password123",
            });
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("status", "OK");
            expect(res.body).toHaveProperty("code", 200);
            expect(res.body.data).toHaveProperty("token"); // Zakładamy, że zwraca token
            expect(res.body.data.user).toHaveProperty("email", "existinguser@example.com");
            expect(res.body.data.user).toHaveProperty("name", "Existing User");
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
            yield user_1.User.create({
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
            yield user_1.User.create({
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
            yield user_1.User.create({
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
});
