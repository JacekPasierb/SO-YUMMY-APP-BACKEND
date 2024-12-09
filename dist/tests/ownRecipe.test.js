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
const recipe_1 = __importDefault(require("../models/recipe"));
describe("ownRecipe API", () => {
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
        yield user_1.User.deleteMany({});
        yield recipe_1.default.deleteMany({});
        // Logowanie użytkownika i generowanie tokena
        const user = yield user_1.User.create({
            name: "Test User",
            email: "testuser@example.com",
            password: "password123",
            verify: true,
        });
        userId = user._id.toString();
        token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.SECRET, {
            expiresIn: "1h",
        });
        user.token = token;
        yield user.save();
    }));
    it("should get own recipes", () => __awaiter(void 0, void 0, void 0, function* () {
        yield recipe_1.default.create({
            title: "Sample Recipe",
            description: "This is a sample recipe",
            owner: userId,
            instructions: "Mix ingredients and cook.",
            category: "Dinner",
            time: "30 minutes",
        });
        const response = yield (0, supertest_1.default)(app_1.default)
            .get(`/api/ownRecipes`)
            .set("Authorization", `Bearer ${token}`);
        expect(response.status).toBe(200);
    }));
});
