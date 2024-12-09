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
const ingredient_1 = __importDefault(require("../models/ingredient"));
describe("Ingredients API", () => {
    let mongoServer;
    let token;
    let ingredientId;
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
        // Logowanie użytkownika i generowanie tokena
        const user = yield user_1.User.create({
            name: "Test User",
            email: "testuser@example.com",
            password: "password123",
            verify: true,
        });
        token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.SECRET, {
            expiresIn: "1h",
        });
        user.token = token;
        yield user.save();
        const ingredients = yield ingredient_1.default.create([
            {
                ttl: "Sugar",
                thb: "thumbnail_url",
                t: "Sugar",
                desc: "Sweet ingredient",
            },
            {
                ttl: "Flour",
                thb: "thumbnail_url",
                t: "Flour",
                desc: "Basic baking ingredient",
            },
            {
                ttl: "Eggs",
                thb: "thumbnail_url",
                t: "Eggs",
                desc: "Protein-rich ingredient",
            },
        ]);
        ingredientId = ingredients[0]._id.toString();
    }));
    it("should get all ingredients", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app_1.default)
            .get("/api/ingredients")
            .set("Authorization", `Bearer ${token}`);
        expect(response.status).toBe(200);
    }));
    it("should return error 500 if there's an error in getAllIngredients", () => __awaiter(void 0, void 0, void 0, function* () {
        jest.spyOn(ingredient_1.default, 'find').mockRejectedValue(new Error("Internal server error"));
        const response = yield (0, supertest_1.default)(app_1.default)
            .get("/api/ingredients")
            .set("Authorization", `Bearer ${token}`);
        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty("error", "Internal server error");
    }));
    it("should get ingredient by id", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app_1.default)
            .get(`/api/ingredients/${ingredientId}`)
            .set("Authorization", `Bearer ${token}`);
        expect(response.status).toBe(200);
    }));
    it("should return error 404 if ingredient not found", () => __awaiter(void 0, void 0, void 0, function* () {
        jest.spyOn(ingredient_1.default, 'findById').mockResolvedValue(null);
        const response = yield (0, supertest_1.default)(app_1.default)
            .get(`/api/ingredients/${ingredientId}`)
            .set("Authorization", `Bearer ${token}`);
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty("error", "Ingredient not found");
    }));
    it("should return error 500 if there's an error in getIngredientById", () => __awaiter(void 0, void 0, void 0, function* () {
        jest.spyOn(ingredient_1.default, 'findById').mockRejectedValue(new Error("Internal server error"));
        const response = yield (0, supertest_1.default)(app_1.default)
            .get(`/api/ingredients/${ingredientId}`)
            .set("Authorization", `Bearer ${token}`);
        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty("error", "Internal server error");
    }));
});
