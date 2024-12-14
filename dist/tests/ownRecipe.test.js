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
const API_ROUTES = {
    OWN_RECIPES: "/api/ownRecipes",
    ADD_RECIPE: "/api/ownRecipes/add",
    DELETE_RECIPE: (id) => `/api/ownRecipes/remove/${id}`,
};
describe("ownRecipe API", () => {
    let mongoServer;
    let token;
    let userId;
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
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield mongoose_1.default.connection.close();
        yield mongoServer.stop();
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
        // Create test recipe
        const recipe = yield recipe_1.default.create({
            title: "Sample Recipe",
            description: "This is a sample recipe",
            owner: userId,
            instructions: "Mix ingredients and cook.",
            category: "Dinner",
            time: "30 minutes",
        });
        recipeId = recipe._id.toString();
    }));
    describe("GET /api/ownRecipes", () => {
        it("should get own recipes", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .get(API_ROUTES.OWN_RECIPES)
                .set("Authorization", `Bearer ${token}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("data");
            expect(response.body.data).toHaveProperty("ownRecipes");
            expect(response.body.data).toHaveProperty("totalOwnRecipes");
            expect(response.body.data.ownRecipes).toBeInstanceOf(Array);
            expect(response.body.data.ownRecipes.length).toBeGreaterThan(0);
            expect(response.body.data.totalOwnRecipes).toBe(response.body.data.ownRecipes.length);
        }));
        it("should return 401 for unauthorized access", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .get(API_ROUTES.OWN_RECIPES)
                .set("Authorization", `Bearer invalidToken`);
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty("error", "Unauthorized");
        }));
        it("should return 404 if page number exceeds total pages", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .get(`${API_ROUTES.OWN_RECIPES}?page=2&limit=1`)
                .set("Authorization", `Bearer ${token}`);
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty("error", "Page number exceeds total number of available pages");
        }));
        it("should handle error 500 in catch", () => __awaiter(void 0, void 0, void 0, function* () {
            jest.spyOn(recipe_1.default, "find").mockImplementation(() => {
                throw new Error("Internal Server Error");
            });
            const response = yield (0, supertest_1.default)(app_1.default)
                .get(API_ROUTES.OWN_RECIPES)
                .set("Authorization", `Bearer ${token}`);
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty("error", "Internal Server Error");
        }));
        it("should return 404 when no own recipes are found", () => __awaiter(void 0, void 0, void 0, function* () {
            yield recipe_1.default.deleteMany({ owner: userId });
            const response = yield (0, supertest_1.default)(app_1.default)
                .get(API_ROUTES.OWN_RECIPES)
                .set("Authorization", `Bearer ${token}`);
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty("error", "Not found own recipes");
        }));
        it("should return 400 for invalid pagination parameters", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .get(`${API_ROUTES.OWN_RECIPES}?page=abc&limit=xyz`)
                .set("Authorization", `Bearer ${token}`);
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("error", "Invalid pagination parameters");
        }));
        it("should return 400 if limit is missing or invalid", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .get(`${API_ROUTES.OWN_RECIPES}?page=1&limit=-10`)
                .set("Authorization", `Bearer ${token}`);
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("error", "Invalid pagination parameters");
        }));
        it("should return 400 if page is less than 1", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .get(`${API_ROUTES.OWN_RECIPES}?page=0&limit=10`)
                .set("Authorization", `Bearer ${token}`);
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("error", "Invalid pagination parameters");
        }));
    });
    describe("POST /api/ownRecipes/add", () => {
        const newRecipe = {
            title: "New Recipe",
            description: "This is a new recipe",
            instructions: "Mix and cook.",
            category: "Breakfast",
            time: "20 minutes",
        };
        it("should add a new own recipe", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .post(API_ROUTES.ADD_RECIPE)
                .set("Authorization", `Bearer ${token}`)
                .send(newRecipe);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("data");
            expect(response.body.data).toHaveProperty("newRecipe");
        }));
        it("should handle error 500 in catch", () => __awaiter(void 0, void 0, void 0, function* () {
            jest.spyOn(recipe_1.default, "create").mockImplementation(() => {
                throw new Error("Internal Server Error");
            });
            const response = yield (0, supertest_1.default)(app_1.default)
                .post(API_ROUTES.ADD_RECIPE)
                .set("Authorization", `Bearer ${token}`)
                .send(newRecipe);
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty("error", "Internal Server Error");
        }));
        it("should return 401 if user is not authenticated", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .post(API_ROUTES.ADD_RECIPE)
                .send(newRecipe);
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty("error", "Unauthorized");
        }));
    });
    describe("DELETE /api/ownRecipes/:recipeId", () => {
        it("should delete an existing recipe", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .delete(API_ROUTES.DELETE_RECIPE(recipeId))
                .set("Authorization", `Bearer ${token}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("message", "Recipe deleted");
            const deletedRecipe = yield recipe_1.default.findById(recipeId);
            expect(deletedRecipe).toBeNull();
        }));
        it("should return 404 if recipe not found", () => __awaiter(void 0, void 0, void 0, function* () {
            const nonExistentId = new mongoose_1.default.Types.ObjectId();
            const response = yield (0, supertest_1.default)(app_1.default)
                .delete(API_ROUTES.DELETE_RECIPE(nonExistentId.toString()))
                .set("Authorization", `Bearer ${token}`);
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty("error", "Recipe not found...");
        }));
        it("should handle error 500 in catch", () => __awaiter(void 0, void 0, void 0, function* () {
            jest.spyOn(recipe_1.default, "findByIdAndDelete").mockImplementation(() => {
                throw new Error("Internal Server Error");
            });
            const response = yield (0, supertest_1.default)(app_1.default)
                .delete(API_ROUTES.DELETE_RECIPE(recipeId))
                .set("Authorization", `Bearer ${token}`);
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty("error", "Internal Server Error");
        }));
    });
});
