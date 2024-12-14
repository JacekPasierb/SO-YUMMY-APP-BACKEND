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
const recipe_1 = __importDefault(require("../models/recipe"));
const user_1 = require("../models/user");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ingredient_1 = __importDefault(require("../models/ingredient"));
const category_1 = __importDefault(require("../models/category"));
const API_ROUTES = {
    RECIPES: "/api/recipes",
    MAIN_PAGE: "/api/recipes/main-page",
    CATEGORY_LIST: "/api/recipes/category-list",
    CATEGORIES: (category) => `/api/recipes/categories/${category}`,
    RECIPE: (id) => `/api/recipes/${id}`,
};
describe("Recipe API", () => {
    let mongoServer;
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
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield mongoose_1.default.connection.close();
        yield mongoServer.stop();
    }));
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        jest.restoreAllMocks();
        jest.clearAllMocks();
        jest.resetAllMocks();
        // Reset database
        yield recipe_1.default.deleteMany({});
        yield user_1.User.deleteMany({});
        yield ingredient_1.default.deleteMany({});
        // Create test user and generate token
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
        const sugar = yield ingredient_1.default.create({
            ttl: "Sugar",
            thb: "thumbnail_url",
            t: "Sugar",
            desc: "Sweet ingredient",
        });
        const recipes = yield recipe_1.default.create([
            {
                title: "Chocolate Cake",
                description: "Delicious chocolate cake",
                category: "Dessert",
                time: 60,
                instructions: "Mix ingredients and bake",
                ingredients: [{ id: sugar._id }],
            },
            {
                title: "Vanilla Ice Cream",
                description: "Creamy vanilla ice cream",
                category: "Dessert",
                time: 30,
                instructions: "Mix ingredients and freeze",
                ingredients: [],
            },
            {
                title: "Pancakes",
                description: "Fluffy pancakes",
                category: "Breakfast",
                time: 20,
                instructions: "Mix ingredients and cook on a griddle",
                ingredients: [],
            },
            {
                title: "Omelette",
                description: "Simple omelette",
                category: "Breakfast",
                time: 10,
                instructions: "Beat eggs and cook",
                ingredients: [],
            },
            {
                title: "Chicken Curry",
                description: "Spicy chicken curry",
                category: "Chicken",
                time: 45,
                instructions: "Cook chicken with spices",
                ingredients: [],
            },
            {
                title: "Grilled Chicken",
                description: "Grilled chicken with herbs",
                category: "Chicken",
                time: 30,
                instructions: "Grill chicken with herbs",
                ingredients: [],
            },
            {
                title: "Fruit Salad",
                description: "Fresh fruit salad",
                category: "Miscellaneous",
                time: 10,
                instructions: "Mix fresh fruits",
                ingredients: [],
            },
            {
                title: "Smoothie",
                description: "Healthy fruit smoothie",
                category: "Miscellaneous",
                time: 5,
                instructions: "Blend fruits with yogurt",
                ingredients: [],
            },
        ]);
        recipeId = recipes[0]._id.toString();
    }));
    describe("GET /api/recipes", () => {
        it("Should return a list of recipes", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default)
                .get(API_ROUTES.RECIPES)
                .set("Authorization", `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(res.body.data.result).toHaveLength(6);
            expect(res.body.data.totalRecipes).toBe(8);
        }));
        it("should filter recipes by title", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default)
                .get(`${API_ROUTES.RECIPES}?query=Chocolate`)
                .set("Authorization", `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(res.body.data.result).toHaveLength(1);
            expect(res.body.data.result[0]).toHaveProperty("title", "Chocolate Cake");
        }));
        it("should filter recipes by ingredient", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default)
                .get(`${API_ROUTES.RECIPES}?ingredient=Sugar`)
                .set("Authorization", `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(res.body.data.result).toHaveLength(1);
            expect(res.body.data.result[0]).toHaveProperty("title", "Chocolate Cake");
        }));
        it("should return 404 if ingredient not found", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default)
                .get(`${API_ROUTES.RECIPES}?ingredient=NonExistent`)
                .set("Authorization", `Bearer ${token}`);
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty("error", "Ingredient not found");
        }));
        it("should handle invalid page and limit values gracefully", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default)
                .get(`${API_ROUTES.RECIPES}?page=invalid&limit=invalid`)
                .set("Authorization", `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(res.body.data.result).toHaveLength(8);
        }));
        it("should return 500 if an error occurs in catch", () => __awaiter(void 0, void 0, void 0, function* () {
            jest.spyOn(recipe_1.default, "find").mockImplementationOnce(() => {
                throw new Error("Database error");
            });
            const res = yield (0, supertest_1.default)(app_1.default)
                .get(API_ROUTES.RECIPES)
                .set("Authorization", `Bearer ${token}`);
            expect(res.status).toBe(500);
            expect(res.body).toHaveProperty("error", "Database error");
        }));
    });
    describe("GET /api/recipes/main-page", () => {
        it("should use default count value when not provided", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default)
                .get(API_ROUTES.MAIN_PAGE)
                .set("Authorization", `Bearer ${token}`);
            expect(res.status).toBe(200);
        }));
        it("should return recipes from four categories", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default)
                .get(`${API_ROUTES.MAIN_PAGE}?count=2`)
                .set("Authorization", `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(res.body.data).toHaveProperty("breakfast");
            expect(res.body.data).toHaveProperty("miscellaneous");
            expect(res.body.data).toHaveProperty("chicken");
            expect(res.body.data).toHaveProperty("dessert");
            expect(res.body.data.breakfast).toHaveLength(2);
            expect(res.body.data.miscellaneous).toHaveLength(2);
            expect(res.body.data.chicken).toHaveLength(2);
            expect(res.body.data.dessert).toHaveLength(2);
        }));
        it("should return 500 if an error occurs", () => __awaiter(void 0, void 0, void 0, function* () {
            jest.spyOn(recipe_1.default, "aggregate").mockImplementationOnce(() => {
                throw new Error("Database error");
            });
            const res = yield (0, supertest_1.default)(app_1.default)
                .get(`${API_ROUTES.MAIN_PAGE}?count=2`)
                .set("Authorization", `Bearer ${token}`);
            expect(res.status).toBe(500);
            expect(res.body).toHaveProperty("error");
        }));
    });
    describe("GET /api/recipes/category-list", () => {
        it("should return list of categories", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default)
                .get(API_ROUTES.CATEGORY_LIST)
                .set("Authorization", `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(res.body.data).toHaveProperty("catArr");
            expect(res.body.data.catArr).toBeInstanceOf(Array);
        }));
        it("should return 500 if an error occurs", () => __awaiter(void 0, void 0, void 0, function* () {
            jest.spyOn(category_1.default, "find").mockImplementationOnce(() => {
                throw new Error("Database error");
            });
            const res = yield (0, supertest_1.default)(app_1.default)
                .get(API_ROUTES.CATEGORY_LIST)
                .set("Authorization", `Bearer ${token}`);
            expect(res.status).toBe(500);
            expect(res.body).toHaveProperty("error");
        }));
        it("should return categories sorted alphabetically", () => __awaiter(void 0, void 0, void 0, function* () {
            yield category_1.default.create([
                {
                    title: "Dessert",
                    description: "Sweet treats",
                    thumb: "dessert_thumb.jpg",
                },
                {
                    title: "Breakfast",
                    description: "Morning meals",
                    thumb: "breakfast_thumb.jpg",
                },
                {
                    title: "Miscellaneous",
                    description: "Various recipes",
                    thumb: "misc_thumb.jpg",
                },
                {
                    title: "Chicken",
                    description: "Chicken dishes",
                    thumb: "chicken_thumb.jpg",
                },
            ]);
            const res = yield (0, supertest_1.default)(app_1.default)
                .get(API_ROUTES.CATEGORY_LIST)
                .set("Authorization", `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(res.body.data.catArr).toEqual([
                "Breakfast",
                "Chicken",
                "Dessert",
                "Miscellaneous",
            ]);
        }));
    });
    describe("GET /api/recipes/categories/:category", () => {
        it("should return recipes for a specific category", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default)
                .get(API_ROUTES.CATEGORIES("Breakfast"))
                .set("Authorization", `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(res.body.data.result).toHaveProperty("length", 2);
            expect(res.body.data.result[0]).toHaveProperty("category", "Breakfast");
        }));
        it("should return 404 if no recipes found for the category", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default)
                .get(API_ROUTES.CATEGORIES("NonExistentCategory"))
                .set("Authorization", `Bearer ${token}`);
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty("error", "No recipes found for this category");
        }));
        it("should return 500 if an error occurs while fetching recipes by category", () => __awaiter(void 0, void 0, void 0, function* () {
            jest.spyOn(recipe_1.default, "find").mockImplementationOnce(() => {
                throw new Error("Database error");
            });
            const res = yield (0, supertest_1.default)(app_1.default)
                .get(API_ROUTES.CATEGORIES("Breakfast"))
                .set("Authorization", `Bearer ${token}`);
            expect(res.status).toBe(500);
            expect(res.body).toHaveProperty("error");
        }));
    });
    describe("GET /api/recipes/:id", () => {
        it("should return a recipe by id", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default)
                .get(API_ROUTES.RECIPE(recipeId))
                .set("Authorization", `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(res.body.data.result).toHaveProperty("_id", recipeId);
        }));
        it("should return 404 if recipe not found", () => __awaiter(void 0, void 0, void 0, function* () {
            const nonExistentId = new mongoose_1.default.Types.ObjectId().toString();
            const res = yield (0, supertest_1.default)(app_1.default)
                .get(API_ROUTES.RECIPE(nonExistentId))
                .set("Authorization", `Bearer ${token}`);
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty("error", "Recipe not found");
        }));
        it("should return 500 if an error occurs while fetching recipe by id", () => __awaiter(void 0, void 0, void 0, function* () {
            jest.spyOn(recipe_1.default, "findById").mockImplementationOnce(() => {
                throw new Error("Database error");
            });
            const res = yield (0, supertest_1.default)(app_1.default)
                .get(API_ROUTES.RECIPE(recipeId))
                .set("Authorization", `Bearer ${token}`);
            expect(res.status).toBe(500);
            expect(res.body).toHaveProperty("error");
        }));
    });
});
