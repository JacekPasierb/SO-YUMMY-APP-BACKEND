"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const shoppingList_1 = __importDefault(require("../models/shoppingList"));
const shoppingListService = __importStar(require("../services/shoppingList"));
describe("shopping-list API", () => {
    let mongoServer;
    let token;
    let userId;
    let recipeId;
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
        jest.restoreAllMocks();
        jest.clearAllMocks();
        // Reset database
        yield user_1.User.deleteMany({});
        yield shoppingList_1.default.deleteMany({});
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
        // create a test ShoppingList
        const shoppingList = yield shoppingList_1.default.create({
            userId: userId,
            items: [
                {
                    ingredientId: new mongoose_1.default.Types.ObjectId(),
                    name: "Test Ingredient",
                    measure: "grams",
                    recipeId: recipeId,
                },
            ],
        });
        ingredientId = shoppingList.items[0].ingredientId.toString();
    }));
    describe("GET /api/shopping-list", () => {
        it("should get shopping list", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .get("/api/shopping-list")
                .set("Authorization", `Bearer ${token}`);
            expect(response.status).toBe(200);
        }));
        it("should return 404 if shopping list not found", () => __awaiter(void 0, void 0, void 0, function* () {
            jest
                .spyOn(shoppingListService, "getShoppingListByUserId")
                .mockResolvedValue(null);
            const response = yield (0, supertest_1.default)(app_1.default)
                .get("/api/shopping-list")
                .set("Authorization", `Bearer ${token}`);
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty("error", "Shopping list not found");
        }));
        it("should return 500 if an error occurs", () => __awaiter(void 0, void 0, void 0, function* () {
            jest
                .spyOn(shoppingListService, "getShoppingListByUserId")
                .mockImplementationOnce(() => {
                throw new Error("Database error");
            });
            const response = yield (0, supertest_1.default)(app_1.default)
                .get("/api/shopping-list")
                .set("Authorization", `Bearer ${token}`);
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty("error", "Internal server error: Database error");
        }));
    });
    describe("POST /api/shopping-list/add", () => {
        const newItem = {
            ingredientId: new mongoose_1.default.Types.ObjectId(),
            name: "New Ingredient",
            measure: "liters",
            recipeId: recipeId,
        };
        it("should add an item to the shopping list", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .post("/api/shopping-list/add")
                .set("Authorization", `Bearer ${token}`)
                .send(newItem);
            expect(response.status).toBe(201);
        }));
        it("should return 500 if an error occurs in catch", () => __awaiter(void 0, void 0, void 0, function* () {
            jest
                .spyOn(shoppingListService, "addIngredientToShoppingList")
                .mockImplementationOnce(() => {
                throw new Error("Database error");
            });
            const response = yield (0, supertest_1.default)(app_1.default)
                .post("/api/shopping-list/add")
                .set("Authorization", `Bearer ${token}`)
                .send(newItem);
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty("error", "Error adding ingredient to shopping list: Database error");
        }));
    });
    describe("DELETE /api/shopping-list/remove", () => {
        it("should remove an item from the shopping list", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .delete(`/api/shopping-list/remove`)
                .set("Authorization", `Bearer ${token}`)
                .send({ ingredientId, recipeId: null });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("message", "Item removed successfully");
        }));
        it("should return 500 if an error occurs in catch", () => __awaiter(void 0, void 0, void 0, function* () {
            jest
                .spyOn(shoppingListService, "deleteIngredientFromShoppingList")
                .mockImplementationOnce(() => {
                throw new Error("Database error");
            });
            const response = yield (0, supertest_1.default)(app_1.default)
                .delete(`/api/shopping-list/remove`)
                .set("Authorization", `Bearer ${token}`)
                .send({ ingredientId, recipeId: null });
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty("error", "Error removing ingredient from shopping list: Database error");
        }));
    });
});
