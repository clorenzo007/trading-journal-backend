import "dotenv/config"; // 🔥 DEBE SER LA PRIMERA LÍNEA

import express from "express";
import cors from "cors";

import { connectDB } from "./config/db.js";
import tradeRoutes from "./routes/trades.js";
import authRoutes from "./routes/auth.js";
import uploadRoutes from "./routes/upload.js";
import importRoutes from "./routes/import.js";
const app = express();

app.use(cors());
app.use(express.json());

app.use("/trades", tradeRoutes);
app.use("/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/import", importRoutes);

connectDB();

app.get("/", (req, res) => {
  res.send("Livermore Journal API");
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
