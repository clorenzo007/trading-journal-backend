import express from "express";
import auth from "../middleware/authMiddleware.js"; // ✅ DEFAULT
import { requireActiveAccount } from "../middleware/activeAccount.js";

import {
  getTrades,
  getTradeById,
  createTrade,
  updateTrade,
  deleteTrade,
} from "../controllers/tradeController.js";

const router = express.Router();

router.use(auth);
router.use(requireActiveAccount);

router.get("/", getTrades);
router.get("/:id", getTradeById);
router.post("/", createTrade);
router.put("/:id", updateTrade);
router.delete("/:id", deleteTrade);

export default router;
