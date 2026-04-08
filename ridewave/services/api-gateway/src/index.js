import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { createProxyMiddleware } from "http-proxy-middleware";
import { verifyJwt } from "./middleware/auth.js";

const app = express();
const port = Number(process.env.PORT || 3000);
const origins = (process.env.CORS_ORIGINS || "").split(",").map((o) => o.trim()).filter(Boolean);

app.use(cors({ origin: origins.length ? origins : true }));
app.use(morgan("combined"));
app.use(express.json());
app.use(rateLimit({ windowMs: 60_000, limit: 100 }));
app.use(verifyJwt);

const withProxy = (target, ws = false) => createProxyMiddleware({
  target,
  changeOrigin: true,
  ws,
  pathRewrite: (path) => path.replace(/^\/api/, "")
});

app.get("/health", (_, res) => {
  res.json({ success: true, data: { service: "api-gateway" }, message: "healthy", timestamp: new Date().toISOString() });
});

app.use("/api/auth", withProxy(process.env.AUTH_SERVICE_URL || "http://localhost:3001"));
app.use("/api/users", withProxy(process.env.USER_SERVICE_URL || "http://localhost:3002"));
app.use("/api/rides", withProxy(process.env.RIDE_SERVICE_URL || "http://localhost:3003"));
app.use("/api/pricing", withProxy(process.env.PRICING_SERVICE_URL || "http://localhost:3005"));
app.use("/api/payments", withProxy(process.env.PAYMENT_SERVICE_URL || "http://localhost:3006"));
app.use("/api/reviews", withProxy(process.env.REVIEW_SERVICE_URL || "http://localhost:3008"));
app.use("/ws/location", withProxy(process.env.LOCATION_SERVICE_URL || "http://localhost:3004", true));

app.listen(port, () => {
  console.log(`api-gateway listening on ${port}`);
});
