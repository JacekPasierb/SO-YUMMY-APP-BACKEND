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
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const user_1 = require("../models/user");
const mongodb_memory_server_1 = require("mongodb-memory-server");
const mongoose_1 = __importDefault(require("mongoose"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const emailService_1 = require("../utils/emailService");
const subscribeServices_1 = require("../services/subscribeServices");
// Mockowanie funkcji sendSubscriptionEmail
jest.mock("../utils/emailService", () => ({
    sendSubscriptionEmail: jest.fn().mockResolvedValue({}),
}));
jest.mock("../services/subscribeServices", () => (Object.assign(Object.assign({}, jest.requireActual("../services/subscribeServices")), { findSubscribe: jest.fn(), createSubscribe: jest.fn().mockResolvedValue({
        _id: "mockedId",
        email: "subscriber@example.com",
        owner: "mockedOwnerId",
    }) })));
describe("Subscribe API", () => {
    let mongoServer;
    let userId;
    let token;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        mongoServer = yield mongodb_memory_server_1.MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        yield mongoose_1.default.connect(uri);
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield mongoose_1.default.disconnect();
        yield mongoServer.stop();
    }));
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        jest.clearAllMocks();
        yield mongoose_1.default.connection.db.dropDatabase();
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
    it("should subscribe a user with valid email", () => __awaiter(void 0, void 0, void 0, function* () {
        subscribeServices_1.findSubscribe.mockResolvedValueOnce(null);
        const res = yield (0, supertest_1.default)(app_1.default)
            .post("/api/subscribe")
            .set("Authorization", `Bearer ${token}`)
            .send({ email: "subscriber@example.com" });
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty("message", "Subscription successful");
        expect(emailService_1.sendSubscriptionEmail).toHaveBeenCalled();
    }));
    it("should return 401 if user is not authenticated", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app_1.default)
            .post("/api/subscribe")
            .send({ email: "subscriber@example.com" });
        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty("error", "Unauthorized");
    }));
    it("should return 409 if user is already subscribed", () => __awaiter(void 0, void 0, void 0, function* () {
        subscribeServices_1.findSubscribe.mockImplementationOnce((query) => __awaiter(void 0, void 0, void 0, function* () {
            if (query.owner) {
                return {
                    _id: "mockedId",
                    email: "subscriber@example.com",
                    owner: userId,
                };
            }
            return null;
        }));
        const res = yield (0, supertest_1.default)(app_1.default)
            .post("/api/subscribe")
            .set("Authorization", `Bearer ${token}`)
            .send({ email: "subscriber@example.com" });
        expect(res.status).toBe(409);
        expect(res.body).toHaveProperty("error", "User is already subscribed");
    }));
    it("should return 409 if email belongs to another user", () => __awaiter(void 0, void 0, void 0, function* () {
        subscribeServices_1.findSubscribe.mockImplementation((query) => __awaiter(void 0, void 0, void 0, function* () {
            if (query.owner) {
                return false;
            }
            if (query.email) {
                return true;
            }
            return null;
        }));
        const res = yield (0, supertest_1.default)(app_1.default)
            .post("/api/subscribe")
            .set("Authorization", `Bearer ${token}`)
            .send({ email: "usertwo@example.com" });
        expect(res.status).toBe(409);
        expect(res.body).toHaveProperty("error", "The email belongs to another user");
    }));
    it("should handle errors during subscription creation", () => __awaiter(void 0, void 0, void 0, function* () {
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
        const res = yield (0, supertest_1.default)(app_1.default)
            .post("/api/subscribe")
            .set("Authorization", `Bearer ${token}`)
            .send({ email: "test@example.com" });
        expect(res.status).toBe(500);
        expect(res.body).toHaveProperty("error", "Internal Server Error");
    }));
});
