import request from "supertest";
import app from "../app";

describe("App", () => {
  it("should return API version on GET /", async () => {
    const response = await request(app).get("/");
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("version", "1.0");
  });

  it("should handle 404 for unknown routes", async () => {
    const response = await request(app).get("/unknown-route");
    expect(response.status).toBe(404);
  });

  it('should handle CORS for allowed origins', async () => {
    const res = await request(app)
      .options('/')
      .set('Origin', 'http://localhost:3000');
    expect(res.status).toBe(204);
  });

  it('should reject CORS for disallowed origins', async () => {
    const res = await request(app)
      .options('/')
      .set('Origin', 'http://disallowed-origin.com');
    expect(res.status).toBe(500);
  });
});
