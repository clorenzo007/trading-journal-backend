import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";

import tradeRoutes from "./routes/trades.js";
import authRoutes from "./routes/auth.js";
import importRoutes from "./routes/import.js";
import accountRoutes from "./routes/accounts.js";
import uploadRoutes from "./routes/upload.js";
import adminRoutes from "./routes/admin.js";
import setupRoutes from "./routes/setup.js";
import conceptRoutes from "./routes/concept.js";

dotenv.config();

const app = express();

// ===========================================
// CORS CONFIGURATION (CRITICAL)
// Allows requests from specific origins (Localhost, Vercel).
// Handles dynamic localhost ports for development convenience.
// ===========================================
const allowedOrigins = [
  "http://localhost:5173",
  "https://trading-journal-livermore.vercel.app",
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : []),
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      
      // Allow any localhost (dynamic ports like 5174, 5175, etc.)
      if (origin.match(/^http:\/\/localhost:\d+$/)) return callback(null, true);

      // Allow Vercel deployment URLs (production and previews)
      if (origin.startsWith("https://trading-journal-livermore") && origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-account-id"],
  }),
);

// handle preflight
app.options("*", cors());

// ================= BODY =================
app.use(express.json());

// ================= DB =================
await connectDB();
//  ==================================
// ======== NO USES CACHE DEL BROWSER =========
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

// ================= HEALTH =================
app.get("/", (req, res) => {
  res.json({ status: "API running" });
});

// ================= ROUTES =================
app.use("/auth", authRoutes);
app.use("/trades", tradeRoutes);
app.use("/import", importRoutes);
app.use("/accounts", accountRoutes);
app.use("/admin", adminRoutes);
app.use("/setups", setupRoutes);
app.use("/concepts", conceptRoutes);
app.use("/", uploadRoutes);

// ================= START =================
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
