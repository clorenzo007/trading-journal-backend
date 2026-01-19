import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { connectDB } from "./config/db.js";
import tradeRoutes from "./routes/trades.js";
import authRoutes from "./routes/auth.js";
import importRoutes from "./routes/import.js";
dotenv.config();

const app = express();

// ===== CORS =====
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://trading-journal-livermore.vercel.app",
    ],
    credentials: true,
  }),
);

app.use(express.json());

// ===== ROUTES =====
app.use("/trades", tradeRoutes);
app.use("/auth", authRoutes);
app.use("/import", importRoutes);

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
