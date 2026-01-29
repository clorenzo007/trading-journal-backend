import express from "express";
import {
  createTrade,
  getTrades,
  getTradeById,
  updateTrade,
  deleteTrade,
} from "../controllers/tradeController.js";

import auth from "../middleware/auth.js"; // 👈 FIX
import { requireActiveAccount } from "../middleware/activeAccount.js";

const router = express.Router();

router.use(auth);
router.use(requireActiveAccount);

router.get("/", getTrades);
router.get("/:id", getTradeById);
router.post("/", createTrade);
router.put("/:id", updateTrade);
router.delete("/:id", deleteTrade);

export default router;
