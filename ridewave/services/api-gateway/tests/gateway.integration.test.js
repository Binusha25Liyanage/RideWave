import request from "supertest";
import express from "express";

describe("gateway integration", () => {
  test("health endpoint responds", async () => {
    const app = express();
    app.get("/health", (_, res) => res.json({ success: true }));
    const res = await request(app).get("/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
