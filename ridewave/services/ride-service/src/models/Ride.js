import mongoose from "mongoose";

const rideSchema = new mongoose.Schema({
  riderId: { type: String, required: true },
  driverId: { type: String },
  status: { type: String, enum: ["requested", "accepted", "started", "completed", "cancelled"], default: "requested" },
  pickup: {
    address: String,
    lat: Number,
    lng: Number
  },
  destination: {
    address: String,
    lat: Number,
    lng: Number
  },
  route: {
    polyline: String,
    distanceKm: Number,
    durationMin: Number
  },
  fare: {
    base: Number,
    surge: Number,
    total: Number,
    currency: { type: String, default: "LKR" }
  },
  timestamps: {
    requested: Date,
    accepted: Date,
    started: Date,
    completed: Date
  },
  paymentStatus: { type: String, default: "pending" },
  cancellationReason: String
}, { timestamps: true });

export const Ride = mongoose.model("Ride", rideSchema);
