import "dotenv/config";
import express from "express";
import crypto from "crypto";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";

const prisma = new PrismaClient();
const app = express();
const port = Number(process.env.PORT || 3001);

app.use(express.json());
app.use(passport.initialize());

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || "",
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  callbackURL: process.env.GOOGLE_CALLBACK_URL || ""
}, async (_, __, profile, done) => {
  const email = profile.emails?.[0]?.value;
  if (!email) return done(new Error("Google account does not expose email"));

  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: profile.displayName || "Google User",
        email,
        passwordHash: await bcrypt.hash(crypto.randomUUID(), 12),
        role: "rider"
      }
    });
  }

  done(null, user);
}));

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(8),
  role: z.enum(["rider", "driver"])
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const signAccess = (user) => jwt.sign({ sub: user.id, role: user.role, email: user.email }, process.env.JWT_SECRET, { expiresIn: "15m" });
const signRefresh = (user) => jwt.sign({ sub: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });

app.get("/health", (_, res) => {
  res.json({ success: true, data: { service: "auth-service" }, message: "healthy", timestamp: new Date().toISOString() });
});

app.post("/auth/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Invalid payload", details: parsed.error.flatten() }, timestamp: new Date().toISOString() });
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return res.status(409).json({ success: false, error: { code: "EMAIL_EXISTS", message: "Email already registered" }, timestamp: new Date().toISOString() });
  }

  const user = await prisma.user.create({
    data: {
      ...parsed.data,
      passwordHash: await bcrypt.hash(parsed.data.password, 12)
    }
  });

  return res.status(201).json({
    success: true,
    data: { id: user.id, email: user.email, role: user.role },
    message: "Registered",
    timestamp: new Date().toISOString()
  });
});

app.post("/auth/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Invalid payload" }, timestamp: new Date().toISOString() });
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
    return res.status(401).json({ success: false, error: { code: "BAD_CREDENTIALS", message: "Invalid email or password" }, timestamp: new Date().toISOString() });
  }

  const accessToken = signAccess(user);
  const refreshToken = signRefresh(user);
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  });

  return res.json({ success: true, data: { accessToken, refreshToken }, message: "Logged in", timestamp: new Date().toISOString() });
});

app.post("/auth/refresh", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ success: false, error: { code: "MISSING_TOKEN", message: "refreshToken required" }, timestamp: new Date().toISOString() });
  }

  const tokenRecord = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
  if (!tokenRecord || tokenRecord.revoked || tokenRecord.expiresAt < new Date()) {
    return res.status(401).json({ success: false, error: { code: "INVALID_REFRESH", message: "Refresh token is not valid" }, timestamp: new Date().toISOString() });
  }

  const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) {
    return res.status(404).json({ success: false, error: { code: "USER_NOT_FOUND", message: "User not found" }, timestamp: new Date().toISOString() });
  }

  return res.json({ success: true, data: { accessToken: signAccess(user) }, message: "Token refreshed", timestamp: new Date().toISOString() });
});

app.post("/auth/logout", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ success: false, error: { code: "MISSING_TOKEN", message: "refreshToken required" }, timestamp: new Date().toISOString() });
  }

  await prisma.refreshToken.updateMany({ where: { token: refreshToken }, data: { revoked: true } });
  return res.json({ success: true, data: null, message: "Logged out", timestamp: new Date().toISOString() });
});

app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"], session: false }));

app.get("/auth/google/callback", passport.authenticate("google", { session: false, failureRedirect: "/auth/google" }), (req, res) => {
  const accessToken = signAccess(req.user);
  const refreshToken = signRefresh(req.user);
  res.json({ success: true, data: { accessToken, refreshToken }, message: "Google auth success", timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`auth-service listening on ${port}`);
});
