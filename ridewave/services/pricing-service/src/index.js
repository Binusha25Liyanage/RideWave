import "dotenv/config";
import express from "express";
import Redis from "ioredis";
import { z } from "zod";
import { calculateFare, surgeFromRatio } from "./engine.js";

const app = express();
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
const port = Number(process.env.PORT || 3005);

const estimateSchema = z.object({
  distanceKm: z.coerce.number().min(0),
  durationMin: z.coerce.number().min(0),
  vehicleType: z.string().default("Economy"),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional()
});

async function getDemandRatio(lat, lng) {
  if (lat == null || lng == null) return 1;
  const nearbyResp = await fetch(`${process.env.LOCATION_SERVICE_URL || "http://localhost:3004"}/location/drivers/nearby?lat=${lat}&lng=${lng}&radius=3`);
  const nearbyData = await nearbyResp.json();
  const online = Array.isArray(nearbyData.data) ? nearbyData.data.length : 0;
  const demandRaw = await redis.get(`${process.env.RIDE_REQUEST_KEY || "ridewave:active_requests"}:${lat.toFixed(2)}:${lng.toFixed(2)}`);
  const demand = Number(demandRaw || 1);
  return online === 0 ? 4.1 : demand / online;
}

app.get("/health", (_, res) => {
  res.json({ success: true, data: { service: "pricing-service" }, message: "healthy", timestamp: new Date().toISOString() });
});

app.get("/pricing/estimate", async (req, res) => {
  const parsed = estimateSchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Invalid query", details: parsed.error.flatten() }, timestamp: new Date().toISOString() });
  }

  const { distanceKm, durationMin, vehicleType, lat, lng } = parsed.data;
  const ratio = await getDemandRatio(lat, lng);
  const surge = surgeFromRatio(ratio);
  const fare = calculateFare({ distanceKm, durationMin, vehicleType, surge });

  return res.json({
    success: true,
    data: {
      fare,
      demandRatio: Number(ratio.toFixed(2))
    },
    message: "Fare estimate",
    timestamp: new Date().toISOString()
  });
});

app.get("/pricing/surge", async (req, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  const ratio = await getDemandRatio(lat, lng);
  const multiplier = surgeFromRatio(ratio);
  return res.json({ success: true, data: { multiplier, demandRatio: Number(ratio.toFixed(2)) }, message: "Surge multiplier", timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`pricing-service listening on ${port}`);
});
