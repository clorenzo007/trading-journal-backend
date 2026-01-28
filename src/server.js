import express from "express";
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

// ================= DATABASE =================
await connectDB();

// ================= RAILWAY CORS FIX =================
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, x-account-id",
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS",
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

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
