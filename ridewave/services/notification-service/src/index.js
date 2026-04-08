import "dotenv/config";
import fs from "fs";
import express from "express";
import { Kafka } from "kafkajs";
import admin from "firebase-admin";
import nodemailer from "nodemailer";
import twilio from "twilio";

const app = express();
const port = Number(process.env.PORT || 3007);

if (process.env.FIREBASE_ADMIN_SDK && fs.existsSync(process.env.FIREBASE_ADMIN_SDK)) {
  admin.initializeApp({ credential: admin.credential.cert(process.env.FIREBASE_ADMIN_SDK) });
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined
});

const sms = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

const kafka = new Kafka({ clientId: "notification-service", brokers: [process.env.KAFKA_BROKER || "localhost:9092"] });
const consumer = kafka.consumer({ groupId: "ridewave-notifications" });

function logDispatch(topic, payload, channels) {
  console.log(JSON.stringify({ topic, channels, payload, timestamp: new Date().toISOString() }));
}

async function sendEmail(to, subject, text) {
  if (!to || !process.env.SMTP_HOST) return;
  await transporter.sendMail({ from: process.env.SMTP_USER, to, subject, text });
}

async function sendSms(to, body) {
  if (!sms || !to || !process.env.TWILIO_FROM) return;
  await sms.messages.create({ from: process.env.TWILIO_FROM, to, body });
}

async function sendPush(token, title, body) {
  if (!admin.apps.length || !token) return;
  await admin.messaging().send({ token, notification: { title, body } });
}

app.get("/health", (_, res) => {
  res.json({ success: true, data: { service: "notification-service" }, message: "healthy", timestamp: new Date().toISOString() });
});

async function startConsumer() {
  await consumer.connect();
  await consumer.subscribe({ topics: ["ride.requested", "ride.accepted", "ride.started", "ride.completed", "ride.cancelled", "payment.failed"] });

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      const payload = JSON.parse(message.value?.toString() || "{}");
      logDispatch(topic, payload, []);

      if (topic === "ride.requested") {
        await sendPush(payload.driverPushToken, "New Ride Request", "A nearby rider needs a pickup.");
        logDispatch(topic, payload, ["push"]);
      }

      if (topic === "ride.accepted") {
        await Promise.all([
          sendPush(payload.riderPushToken, "Driver Assigned", "Your driver is on the way."),
          sendSms(payload.riderPhone, "RideWave: Your ride was accepted.")
        ]);
        logDispatch(topic, payload, ["push", "sms"]);
      }

      if (topic === "ride.started") {
        await sendPush(payload.riderPushToken, "Ride Started", "Your trip has started.");
        logDispatch(topic, payload, ["push"]);
      }

      if (topic === "ride.completed") {
        await Promise.all([
          sendPush(payload.riderPushToken, "Ride Completed", "Thanks for riding with RideWave."),
          sendPush(payload.driverPushToken, "Trip Completed", "Trip completed successfully."),
          sendEmail(payload.riderEmail, "RideWave Receipt", `Your fare total: ${payload.fare?.total || 0}`)
        ]);
        logDispatch(topic, payload, ["push", "email"]);
      }

      if (topic === "ride.cancelled") {
        await Promise.all([
          sendPush(payload.riderPushToken, "Ride Cancelled", "Your ride was cancelled."),
          sendPush(payload.driverPushToken, "Ride Cancelled", "The ride was cancelled."),
          sendSms(payload.riderPhone, "RideWave: Your ride was cancelled."),
          sendSms(payload.driverPhone, "RideWave: The ride was cancelled.")
        ]);
        logDispatch(topic, payload, ["push", "sms"]);
      }

      if (topic === "payment.failed") {
        await Promise.all([
          sendPush(payload.riderPushToken, "Payment Failed", "Please retry your payment method."),
          sendEmail(payload.riderEmail, "Payment failed", "Your recent payment could not be processed.")
        ]);
        logDispatch(topic, payload, ["push", "email"]);
      }
    }
  });
}

app.listen(port, async () => {
  console.log(`notification-service listening on ${port}`);
  await startConsumer();
});
