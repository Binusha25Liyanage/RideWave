import "dotenv/config";
import http from "http";
import express from "express";
import { Server } from "socket.io";
import Redis from "ioredis";
import { Kafka } from "kafkajs";

const app = express();
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
const kafka = new Kafka({ clientId: "location-service", brokers: [process.env.KAFKA_BROKER || "localhost:9092"] });
const producer = kafka.producer();
const port = Number(process.env.PORT || 3004);

io.on("connection", (socket) => {
  socket.on("driver:location", async (payload) => {
    const { driverId, lat, lng, heading = 0, speed = 0 } = payload;
    await redis.geoadd("drivers:online", lng, lat, driverId);
    await redis.hset(`driver:${driverId}`, {
      lat,
      lng,
      heading,
      speed,
      updatedAt: Date.now()
    });

    io.emit("location:update", payload);
    await producer.send({ topic: "location.update", messages: [{ value: JSON.stringify({ ...payload, timestamp: new Date().toISOString() }) }] });
  });

  socket.on("disconnect", () => {
    // Driver can explicitly set offline via REST endpoint.
  });
});

app.get("/health", (_, res) => {
  res.json({ success: true, data: { service: "location-service" }, message: "healthy", timestamp: new Date().toISOString() });
});

app.get("/location/drivers/nearby", async (req, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  const radius = Number(req.query.radius || 5);

  const results = await redis.georadius("drivers:online", lng, lat, radius, "km", "WITHCOORD", "WITHDIST", "ASC", "COUNT", 10);
  const drivers = results.map((row) => ({
    driverId: row[0],
    distanceKm: Number(row[1]),
    lng: Number(row[2][0]),
    lat: Number(row[2][1])
  }));

  return res.json({ success: true, data: drivers, message: "Nearby drivers", timestamp: new Date().toISOString() });
});

app.get("/location/driver/:id", async (req, res) => {
  const data = await redis.hgetall(`driver:${req.params.id}`);
  if (!data || !data.lat) {
    return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Driver position not found" }, timestamp: new Date().toISOString() });
  }

  return res.json({ success: true, data, message: "Driver position", timestamp: new Date().toISOString() });
});

app.post("/location/driver/:id/offline", async (req, res) => {
  await redis.zrem("drivers:online", req.params.id);
  await redis.del(`driver:${req.params.id}`);
  return res.json({ success: true, data: null, message: "Driver set offline", timestamp: new Date().toISOString() });
});

async function start() {
  await producer.connect();
  server.listen(port, () => console.log(`location-service listening on ${port}`));
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
