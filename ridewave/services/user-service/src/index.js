import "dotenv/config";
import express from "express";
import multer from "multer";
import { PrismaClient } from "@prisma/client";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { z } from "zod";

const app = express();
const prisma = new PrismaClient();
const upload = multer({ storage: multer.memoryStorage() });
const s3 = new S3Client({ region: process.env.AWS_REGION || "us-east-1" });
const port = Number(process.env.PORT || 3002);

app.use(express.json());

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  savedAddresses: z.array(z.string()).optional(),
  paymentMethods: z.array(z.string()).optional(),
  isOnline: z.boolean().optional()
});

app.get("/health", (_, res) => {
  res.json({ success: true, data: { service: "user-service" }, message: "healthy", timestamp: new Date().toISOString() });
});

app.get("/users/:id", async (req, res) => {
  const rider = await prisma.rider.findUnique({ where: { id: req.params.id } });
  if (rider) return res.json({ success: true, data: rider, message: "Rider profile", timestamp: new Date().toISOString() });

  const driver = await prisma.driver.findUnique({ where: { id: req.params.id } });
  if (!driver) {
    return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Profile not found" }, timestamp: new Date().toISOString() });
  }

  return res.json({ success: true, data: driver, message: "Driver profile", timestamp: new Date().toISOString() });
});

app.put("/users/:id", upload.single("avatar"), async (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Invalid payload", details: parsed.error.flatten() }, timestamp: new Date().toISOString() });
  }

  let avatarUrl;
  if (req.file && process.env.AWS_S3_BUCKET) {
    const key = `avatars/${req.params.id}-${Date.now()}.jpg`;
    await s3.send(new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype
    }));
    avatarUrl = `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${key}`;
  }

  const updatedDriver = await prisma.driver.updateMany({
    where: { id: req.params.id },
    data: { ...parsed.data, ...(avatarUrl ? { avatarUrl } : {}) }
  });

  if (updatedDriver.count === 0) {
    await prisma.rider.updateMany({ where: { id: req.params.id }, data: parsed.data });
  }

  return res.json({ success: true, data: { id: req.params.id, avatarUrl }, message: "Profile updated", timestamp: new Date().toISOString() });
});

app.get("/users/drivers/nearby", async (req, res) => {
  const lat = req.query.lat;
  const lng = req.query.lng;
  const radius = req.query.radius || 5;

  const response = await fetch(`${process.env.LOCATION_SERVICE_URL || "http://localhost:3004"}/location/drivers/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
  const data = await response.json();
  return res.json({ success: true, data, message: "Nearby drivers", timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`user-service listening on ${port}`);
});
