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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = require("../models/user");
const subscribeServices_1 = require("../services/subscribeServices");
const emailService_1 = require("../utils/emailService");
jest.mock("../services/subscribeServices");
jest.mock("../utils/emailService", () => ({
    sendSubscriptionEmail: jest.fn().mockResolvedValue({}),
}));
const API_ROUTES = {
    SUBSCRIBE: "/api/subscribe",
};
describe("Subscribe API", () => {
    let mongoServer;
    let token;
    let userId;
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
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        jest.restoreAllMocks();
        jest.clearAllMocks();
        // Reset database
        yield user_1.User.deleteMany({});
        // Create test user and generate token
        const user = yield user_1.User.create({
            name: "Test User",
            email: "testuser@example.com",
            password: "password123",
            verify: true,
        });
        userId = user._id.toString();
        token = jsonwebtoken_1.default.sign({ id: userId }, process.env.SECRET, {
            expiresIn: "1h",
        });
        user.token = token;
        yield user.save();
    }));
    describe("POST /api/subscribe", () => {
        const validEmail = "subscriber@example.com";
        it("should subscribe a user with a valid email", () => __awaiter(void 0, void 0, void 0, function* () {
            subscribeServices_1.findSubscribe.mockResolvedValueOnce(false);
            subscribeServices_1.createSubscribe.mockResolvedValueOnce({
                _id: "mockedId",
                email: validEmail,
                owner: userId,
            });
            const response = yield (0, supertest_1.default)(app_1.default)
                .post(API_ROUTES.SUBSCRIBE)
                .set("Authorization", `Bearer ${token}`)
                .send({ email: validEmail });
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty("message", "Subscription successful");
            expect(emailService_1.sendSubscriptionEmail).toHaveBeenCalledWith({
                to: validEmail,
                subject: "SO YUMMY APP subscription",
                html: expect.any(String),
            });
        }));
        it("should return 401 for unauthorized access", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .post(API_ROUTES.SUBSCRIBE)
                .send({ email: validEmail });
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty("error", "Unauthorized");
        }));
        it("should return 409 if the user is already subscribed", () => __awaiter(void 0, void 0, void 0, function* () {
            subscribeServices_1.findSubscribe.mockResolvedValueOnce({
                _id: "mockedId",
                email: validEmail,
                owner: userId,
            });
            const response = yield (0, supertest_1.default)(app_1.default)
                .post(API_ROUTES.SUBSCRIBE)
                .set("Authorization", `Bearer ${token}`)
                .send({ email: validEmail });
            expect(response.status).toBe(409);
            expect(response.body).toHaveProperty("error", "User is already subscribed");
        }));
        it("should return 409 if the email belongs to another user", () => __awaiter(void 0, void 0, void 0, function* () {
            subscribeServices_1.findSubscribe.mockImplementation((query) => {
                if (query.email === validEmail) {
                    return { _id: "mockedId", email: validEmail, owner: "otherUserId" };
                }
                return null;
            });
            const response = yield (0, supertest_1.default)(app_1.default)
                .post(API_ROUTES.SUBSCRIBE)
                .set("Authorization", `Bearer ${token}`)
                .send({ email: validEmail });
            expect(response.status).toBe(409);
            expect(response.body).toHaveProperty("error", "The email belongs to another user");
        }));
        it("should handle server errors during subscription creation", () => __awaiter(void 0, void 0, void 0, function* () {
            subscribeServices_1.findSubscribe.mockImplementation((query) => __awaiter(void 0, void 0, void 0, function* () {
                if (query.owner) {
                    return false;
                }
                if (query.email) {
                    return false;
                }
                return false;
            }));
            subscribeServices_1.createSubscribe.mockRejectedValueOnce(new Error("Internal Server Error"));
            const response = yield (0, supertest_1.default)(app_1.default)
                .post(API_ROUTES.SUBSCRIBE)
                .set("Authorization", `Bearer ${token}`)
                .send({ email: validEmail });
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty("error", "Internal Server Error");
        }));
        it("should return 400 if email is missing", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .post(API_ROUTES.SUBSCRIBE)
                .set("Authorization", `Bearer ${token}`)
                .send({});
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("error", "Email is required");
        }));
        it("should return 400 if email format is invalid", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .post(API_ROUTES.SUBSCRIBE)
                .set("Authorization", `Bearer ${token}`)
                .send({ email: "invalid-email" });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("error", "Invalid email format");
        }));
    });
});
