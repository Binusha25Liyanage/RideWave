import "dotenv/config";
import express from "express";
import Stripe from "stripe";
import PDFDocument from "pdfkit";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const app = express();
const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", { apiVersion: "2024-06-20" });
const port = Number(process.env.PORT || 3006);

app.use(express.json());

const chargeSchema = z.object({
  userId: z.string(),
  amount: z.number().positive(),
  currency: z.string().default("lkr"),
  paymentMethodId: z.string().optional(),
  rideId: z.string().optional()
});

app.get("/health", (_, res) => {
  res.json({ success: true, data: { service: "payment-service" }, message: "healthy", timestamp: new Date().toISOString() });
});

app.post("/payments/charge", async (req, res) => {
  const parsed = chargeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Invalid payload", details: parsed.error.flatten() }, timestamp: new Date().toISOString() });
  }

  const intent = await stripe.paymentIntents.create({
    amount: Math.round(parsed.data.amount * 100),
    currency: parsed.data.currency,
    payment_method: parsed.data.paymentMethodId,
    confirm: Boolean(parsed.data.paymentMethodId),
    automatic_payment_methods: parsed.data.paymentMethodId ? undefined : { enabled: true }
  });

  const tx = await prisma.transaction.create({
    data: {
      userId: parsed.data.userId,
      rideId: parsed.data.rideId,
      type: "charge",
      status: intent.status,
      amount: parsed.data.amount,
      stripeId: intent.id
    }
  });

  return res.status(201).json({ success: true, data: { paymentIntent: intent, transaction: tx }, message: "Charge created", timestamp: new Date().toISOString() });
});

app.post("/payments/wallet/topup", async (req, res) => {
  const { userId, amount } = req.body;
  const wallet = await prisma.wallet.upsert({
    where: { userId },
    update: { balance: { increment: amount } },
    create: { userId, balance: amount }
  });

  await prisma.transaction.create({ data: { userId, amount, type: "wallet_topup", status: "succeeded" } });
  return res.json({ success: true, data: wallet, message: "Wallet topped up", timestamp: new Date().toISOString() });
});

app.get("/payments/wallet/:userId", async (req, res) => {
  const wallet = await prisma.wallet.findUnique({ where: { userId: req.params.userId } });
  return res.json({ success: true, data: wallet || { userId: req.params.userId, balance: 0 }, message: "Wallet balance", timestamp: new Date().toISOString() });
});

app.get("/payments/receipts/:rideId", async (req, res) => {
  const tx = await prisma.transaction.findFirst({ where: { rideId: req.params.rideId, type: "charge" }, orderBy: { createdAt: "desc" } });
  if (!tx) {
    return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Receipt not found" }, timestamp: new Date().toISOString() });
  }

  const doc = new PDFDocument();
  const chunks = [];
  doc.on("data", (chunk) => chunks.push(chunk));
  doc.on("end", () => {
    const pdf = Buffer.concat(chunks);
    res.setHeader("Content-Type", "application/pdf");
    res.send(pdf);
  });

  doc.fontSize(18).text("RideWave Receipt");
  doc.moveDown();
  doc.text(`Ride ID: ${req.params.rideId}`);
  doc.text(`Transaction ID: ${tx.id}`);
  doc.text(`Amount: LKR ${tx.amount.toFixed(2)}`);
  doc.text(`Status: ${tx.status}`);
  doc.text(`Date: ${tx.createdAt.toISOString()}`);
  doc.end();
});

app.post("/payments/refund/:rideId", async (req, res) => {
  const tx = await prisma.transaction.findFirst({ where: { rideId: req.params.rideId, type: "charge" }, orderBy: { createdAt: "desc" } });
  if (!tx?.stripeId) {
    return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Charge transaction not found" }, timestamp: new Date().toISOString() });
  }

  const refund = await stripe.refunds.create({ payment_intent: tx.stripeId });
  await prisma.transaction.create({
    data: {
      userId: tx.userId,
      rideId: tx.rideId,
      amount: tx.amount,
      type: "refund",
      status: refund.status || "pending",
      stripeId: refund.id
    }
  });

  return res.json({ success: true, data: refund, message: "Refund initiated", timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`payment-service listening on ${port}`);
});
