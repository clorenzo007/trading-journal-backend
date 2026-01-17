import express from "express";
import {
  createTrade,
  getTrades,
  getTradeById,
  deleteTrade,
  updateTrade,
  reviewTrade,
  uploadEntryImage,
  uploadReviewImage,
  deleteEntryImage,
  deleteReviewImage,
} from "../controllers/tradeController.js";

import { protect } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// 🔐 Protección global
router.use(protect);

// CRUD
router.post("/", createTrade);
router.get("/", getTrades);
router.get("/:id", getTradeById);
router.put("/:id", updateTrade);
router.delete("/:id", deleteTrade);

// Review
router.post("/:id/review", reviewTrade);

// Imágenes
router.post("/:id/entry-image", upload.single("image"), uploadEntryImage);
router.post("/:id/review-image", upload.single("image"), uploadReviewImage);

router.delete("/:id/entry-image", deleteEntryImage);
router.delete("/:id/review-image", deleteReviewImage);

export default router;
