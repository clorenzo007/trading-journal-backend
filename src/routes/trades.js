import express from "express";
import {
  createTrade,
  getTrades,
  getTradeById,
  updateTrade,
  deleteTrade,
} from "../controllers/tradeController.js";

import uploadRoutes from "./upload.js";
import { protect } from "../middleware/auth.js";
import { requireActiveAccount } from "../middleware/activeAccount.js";

const router = express.Router();

router.use(protect);
router.use(requireActiveAccount);

// CRUD
router.post("/", createTrade);
router.get("/", getTrades);
router.get("/:id", getTradeById);
router.put("/:id", updateTrade);
router.delete("/:id", deleteTrade);

// IMAGES
router.use("/", uploadRoutes);

export default router;
