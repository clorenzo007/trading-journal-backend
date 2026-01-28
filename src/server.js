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

// ================= DATABASE FIRST =================
await connectDB();

// ================= CORS =================
const allowedOrigins = [
  "http://localhost:5173",
  "https://trading-journal-livermore.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-account-id"],
  }),
);

app.options("*", cors());

// ================= BODY =================
app.use(express.json());

// ================= ROUTES =================
app.use("/trades", tradeRoutes);
app.use("/auth", authRoutes);
app.use("/import", importRoutes);
app.use("/accounts", accountRoutes);
app.use("/admin", adminRoutes);
app.use("/", uploadRoutes);

// ================= HEALTH =================
app.get("/", (req, res) => {
  res.json({ status: "API running" });
});

// ================= START =================
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
