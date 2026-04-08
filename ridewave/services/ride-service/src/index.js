import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import axios from "axios";
import { z } from "zod";
import { Ride } from "./models/Ride.js";
import { producer, emit } from "./lib/kafka.js";

const app = express();
const port = Number(process.env.PORT || 3003);

app.use(express.json());

const requestRideSchema = z.object({
  riderId: z.string().min(1),
  pickup: z.object({ address: z.string(), lat: z.number(), lng: z.number() }),
  destination: z.object({ address: z.string(), lat: z.number(), lng: z.number() }),
  vehicleType: z.string().default("Economy")
});

async function routeDetails(pickup, destination) {
  if (!process.env.ORS_API_KEY) {
    return { polyline: "", distanceKm: 0, durationMin: 0 };
  }

  const response = await axios.get("https://api.openrouteservice.org/v2/directions/driving-car", {
    params: {
      api_key: process.env.ORS_API_KEY,
      start: `${pickup.lng},${pickup.lat}`,
      end: `${destination.lng},${destination.lat}`
    }
  });

  const feature = response.data.features?.[0];
  const summary = feature?.properties?.summary || {};

  return {
    polyline: feature?.geometry ? JSON.stringify(feature.geometry.coordinates) : "",
    distanceKm: Number((summary.distance / 1000).toFixed(2)),
    durationMin: Number((summary.duration / 60).toFixed(1))
  };
}

app.get("/health", (_, res) => {
  res.json({ success: true, data: { service: "ride-service" }, message: "healthy", timestamp: new Date().toISOString() });
});

app.post("/rides/request", async (req, res) => {
  const parsed = requestRideSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Invalid payload", details: parsed.error.flatten() }, timestamp: new Date().toISOString() });
  }

  const route = await routeDetails(parsed.data.pickup, parsed.data.destination);
  const pricingResp = await axios.get(`${process.env.PRICING_SERVICE_URL || "http://localhost:3005"}/pricing/estimate`, {
    params: {
      distanceKm: route.distanceKm,
      durationMin: route.durationMin,
      vehicleType: parsed.data.vehicleType,
      lat: parsed.data.pickup.lat,
      lng: parsed.data.pickup.lng
    }
  }).catch(() => ({ data: { data: { fare: { base: 200, surge: 1, total: 200, currency: "LKR" } } } }));

  const ride = await Ride.create({
    riderId: parsed.data.riderId,
    status: "requested",
    pickup: parsed.data.pickup,
    destination: parsed.data.destination,
    route,
    fare: pricingResp.data.data.fare,
    timestamps: { requested: new Date() }
  });

  await emit("ride.requested", {
    rideId: ride.id,
    riderId: ride.riderId,
    pickup: ride.pickup,
    destination: ride.destination,
    vehicleType: parsed.data.vehicleType,
    estimatedFare: ride.fare.total,
    timestamp: new Date().toISOString()
  });

  return res.status(201).json({ success: true, data: ride, message: "Ride requested", timestamp: new Date().toISOString() });
});

app.post("/rides/:id/accept", async (req, res) => {
  const ride = await Ride.findByIdAndUpdate(req.params.id, {
    status: "accepted",
    driverId: req.body.driverId,
    "timestamps.accepted": new Date()
  }, { new: true });

  if (!ride) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Ride not found" }, timestamp: new Date().toISOString() });

  await emit("ride.accepted", { rideId: ride.id, riderId: ride.riderId, driverId: ride.driverId, timestamp: new Date().toISOString() });
  return res.json({ success: true, data: ride, message: "Ride accepted", timestamp: new Date().toISOString() });
});

app.post("/rides/:id/start", async (req, res) => {
  const ride = await Ride.findByIdAndUpdate(req.params.id, { status: "started", "timestamps.started": new Date() }, { new: true });
  if (!ride) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Ride not found" }, timestamp: new Date().toISOString() });
  await emit("ride.started", { rideId: ride.id, riderId: ride.riderId, driverId: ride.driverId, timestamp: new Date().toISOString() });
  return res.json({ success: true, data: ride, message: "Ride started", timestamp: new Date().toISOString() });
});

app.post("/rides/:id/complete", async (req, res) => {
  const ride = await Ride.findByIdAndUpdate(req.params.id, { status: "completed", paymentStatus: "paid", "timestamps.completed": new Date() }, { new: true });
  if (!ride) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Ride not found" }, timestamp: new Date().toISOString() });

  await emit("ride.completed", {
    rideId: ride.id,
    riderId: ride.riderId,
    driverId: ride.driverId,
    fare: ride.fare,
    distanceKm: ride.route?.distanceKm,
    durationMin: ride.route?.durationMin,
    timestamp: new Date().toISOString()
  });

  return res.json({ success: true, data: ride, message: "Ride completed", timestamp: new Date().toISOString() });
});

app.post("/rides/:id/cancel", async (req, res) => {
  const ride = await Ride.findByIdAndUpdate(req.params.id, { status: "cancelled", cancellationReason: req.body.reason || "unspecified" }, { new: true });
  if (!ride) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Ride not found" }, timestamp: new Date().toISOString() });
  await emit("ride.cancelled", { rideId: ride.id, riderId: ride.riderId, driverId: ride.driverId, reason: ride.cancellationReason, timestamp: new Date().toISOString() });
  return res.json({ success: true, data: ride, message: "Ride cancelled", timestamp: new Date().toISOString() });
});

app.get("/rides/:id", async (req, res) => {
  const ride = await Ride.findById(req.params.id);
  if (!ride) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Ride not found" }, timestamp: new Date().toISOString() });
  return res.json({ success: true, data: ride, message: "Ride details", timestamp: new Date().toISOString() });
});

app.get("/rides/history/:userId", async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 20);
  const skip = (page - 1) * limit;

  const [rides, total] = await Promise.all([
    Ride.find({ $or: [{ riderId: req.params.userId }, { driverId: req.params.userId }] }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Ride.countDocuments({ $or: [{ riderId: req.params.userId }, { driverId: req.params.userId }] })
  ]);

  return res.json({ success: true, data: rides, total, page, totalPages: Math.ceil(total / limit), message: "Ride history", timestamp: new Date().toISOString() });
});

async function start() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/ride_db");
  await producer.connect();
  app.listen(port, () => console.log(`ride-service listening on ${port}`));
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
