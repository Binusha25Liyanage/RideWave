import "dotenv/config";
import express from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const app = express();
const prisma = new PrismaClient();
const port = Number(process.env.PORT || 3008);

app.use(express.json());

const reviewSchema = z.object({
  rideId: z.string(),
  riderId: z.string(),
  driverId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional()
});

app.get("/health", (_, res) => {
  res.json({ success: true, data: { service: "review-service" }, message: "healthy", timestamp: new Date().toISOString() });
});

app.post("/reviews", async (req, res) => {
  const parsed = reviewSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Invalid payload", details: parsed.error.flatten() }, timestamp: new Date().toISOString() });
  }

  const review = await prisma.review.create({ data: parsed.data });
  return res.status(201).json({ success: true, data: review, message: "Review created", timestamp: new Date().toISOString() });
});

app.get("/reviews/:driverId", async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 20);
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.review.findMany({ where: { driverId: req.params.driverId }, skip, take: limit, orderBy: { createdAt: "desc" } }),
    prisma.review.count({ where: { driverId: req.params.driverId } })
  ]);

  return res.json({ success: true, data, total, page, totalPages: Math.ceil(total / limit), message: "Driver reviews", timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`review-service listening on ${port}`);
});
