import express from "express";
import multer from "multer";
import {
  createTrade,
  getTrades,
  getTradeById,
  updateTrade,
  deleteTrade,
} from "../controllers/tradeController.js";

import {
  uploadEntryImage,
  uploadReviewImage,
  deleteEntryImage,
  deleteReviewImage,
} from "../controllers/tradeImagesController.js";

import { protect } from "../middleware/auth.js";
import { requireActiveAccount } from "../middleware/activeAccount.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.use(protect);
router.use(requireActiveAccount);

// CRUD
router.post("/", createTrade);
router.get("/", getTrades);
router.get("/:id", getTradeById);
router.put("/:id", updateTrade);
router.delete("/:id", deleteTrade);

// IMAGES
router.post("/:id/entry-image", upload.single("image"), uploadEntryImage);
router.post("/:id/review-image", upload.single("image"), uploadReviewImage);
router.delete("/:id/entry-image", deleteEntryImage);
router.delete("/:id/review-image", deleteReviewImage);

export default router;
