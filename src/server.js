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

dotenv.config();

const app = express();

// ===== CORS =====
import cors from "cors";

const allowedOrigins = [
  "http://localhost:5173",
  "https://trading-journal-livermore.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // permitir requests sin origin (Postman, mobile apps)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "x-account-id"],
  }),
);

// 🔴 MUY IMPORTANTE PARA PREFLIGHT
app.options("*", cors());

// ===== BODY =====
app.use(express.json());

// ===== ROUTES =====
app.use("/trades", tradeRoutes);
app.use("/auth", authRoutes);
app.use("/import", importRoutes);
app.use("/accounts", accountRoutes);
app.use("/", uploadRoutes); // ← IMPORTANTE: rutas de imágenes
app.use("/admin", adminRoutes);

// ===== HEALTH =====
app.get("/", (req, res) => {
  res.send("Livermore Journal API running");
});

// ===== DB =====
connectDB();

// ===== PORT =====
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
