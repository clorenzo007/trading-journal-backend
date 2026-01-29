import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getTrades,
  createTrade,
  updateTrade,
  deleteTrade,
} from "../controllers/tradeController.js";

const router = express.Router();

router.use(protect);

router.get("/", getTrades);
router.post("/", createTrade);
router.put("/:id", updateTrade);
router.delete("/:id", deleteTrade);

export default router;
