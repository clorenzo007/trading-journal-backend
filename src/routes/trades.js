import express from "express";
import auth from "../middleware/authMiddleware.js"; // ✅ DEFAULT
import { requireActiveAccount } from "../middleware/activeAccount.js";

import {
  getTrades,
  getTradeById,
  createTrade,
  updateTrade,
  deleteTrade,
  deleteTrades,
} from "../controllers/tradeController.js";

const router = express.Router();

// ===========================================
// TRADE ROUTES
// Base Path: /trades
// Requires: Auth + Active Account
// ===========================================
router.use(auth);
router.use(requireActiveAccount);

router.get("/", getTrades);
router.get("/:id", getTradeById);
router.post("/", createTrade);
router.put("/:id", updateTrade);
router.delete("/batch", deleteTrades); // 🔥 Must be before /:id to avoid conflict if id is 'batch' (though id is usually objectId)
router.delete("/:id", deleteTrade);

export default router;
