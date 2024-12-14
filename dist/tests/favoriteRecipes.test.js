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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const recipe_1 = __importDefault(require("../models/recipe"));
const API_ROUTES = {
    FAVORITES: "/api/favorite",
    ADD_FAVORITE: (recipeId) => `/api/favorite/add/${recipeId}`,
    REMOVE_FAVORITE: (recipeId) => `/api/favorite/remove/${recipeId}`,
};
describe("Favorite Recipes API", () => {
    let mongoServer;
    let userId;
    let token;
    let recipeId;
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
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        jest.restoreAllMocks();
        jest.clearAllMocks();
        // Reset database
        yield user_1.User.deleteMany({});
        yield recipe_1.default.deleteMany({});
        // Create test user and generate token
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
        // Create a test recipe
        const recipe = yield recipe_1.default.create({
            title: "Test Recipe",
            description: "A test recipe",
            category: "Test",
            time: 30,
            instructions: "Test instructions",
            ingredients: [],
            favorites: [],
        });
        recipeId = recipe._id.toString();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield mongoose_1.default.connection.close();
        yield mongoServer.stop();
    }));
    describe("GET /api/favorite/", () => {
        it("should get favorite recipes", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .get(API_ROUTES.FAVORITES)
                .set("Authorization", `Bearer ${token}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("data");
            expect(response.body.data).toHaveProperty("favoriteRecipes");
            expect(response.body.data.favoriteRecipes).toBeInstanceOf(Array);
        }));
        it("should return error 500 if an error occurs", () => __awaiter(void 0, void 0, void 0, function* () {
            jest.spyOn(recipe_1.default, "find").mockImplementationOnce(() => {
                throw new Error("Database error");
            });
            const response = yield (0, supertest_1.default)(app_1.default)
                .get(API_ROUTES.FAVORITES)
                .set("Authorization", `Bearer ${token}`);
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty("error");
            expect(response.body.error).toBe("Database error");
        }));
    });
    describe("POST /api/favorite/:recipeId", () => {
        it("should add a recipe to favorites", () => __awaiter(void 0, void 0, void 0, function* () {
            jest.spyOn(recipe_1.default, "findByIdAndUpdate").mockResolvedValue(true);
            const response = yield (0, supertest_1.default)(app_1.default)
                .patch(API_ROUTES.ADD_FAVORITE(recipeId))
                .set("Authorization", `Bearer ${token}`);
            expect(response.status).toBe(200);
        }));
        it("should return 404 if recipe not found", () => __awaiter(void 0, void 0, void 0, function* () {
            jest.spyOn(recipe_1.default, "findByIdAndUpdate").mockResolvedValue(false);
            const response = yield (0, supertest_1.default)(app_1.default)
                .patch(API_ROUTES.ADD_FAVORITE(recipeId))
                .set("Authorization", `Bearer ${token}`);
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty("error", "Recipe not found");
        }));
        it("should return 500 if an error occurs while adding to favorites", () => __awaiter(void 0, void 0, void 0, function* () {
            jest
                .spyOn(recipe_1.default, "findByIdAndUpdate")
                .mockRejectedValue(new Error("Database error"));
            const response = yield (0, supertest_1.default)(app_1.default)
                .patch(API_ROUTES.ADD_FAVORITE(recipeId))
                .set("Authorization", `Bearer ${token}`);
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty("error", "Database error");
        }));
    });
    describe("DELETE /api/favorite/remove/:recipeId", () => {
        it("should remove recipe with favorite's recipe", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .delete(API_ROUTES.REMOVE_FAVORITE(recipeId))
                .set("Authorization", `Bearer ${token}`);
            expect(response.status).toBe(200);
        }));
        it("should return 404 if recipe not found", () => __awaiter(void 0, void 0, void 0, function* () {
            jest.spyOn(recipe_1.default, "findByIdAndUpdate").mockResolvedValue(false);
            const response = yield (0, supertest_1.default)(app_1.default)
                .delete(API_ROUTES.REMOVE_FAVORITE(recipeId))
                .set("Authorization", `Bearer ${token}`);
            expect(response.status).toBe(404);
        }));
        it("should return 500 if an error occurs while remove from favorites", () => __awaiter(void 0, void 0, void 0, function* () {
            jest
                .spyOn(recipe_1.default, "findByIdAndUpdate")
                .mockRejectedValue(new Error("Database error"));
            const response = yield (0, supertest_1.default)(app_1.default)
                .delete(API_ROUTES.REMOVE_FAVORITE(recipeId))
                .set("Authorization", `Bearer ${token}`);
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty("error", "Database error");
        }));
    });
});
