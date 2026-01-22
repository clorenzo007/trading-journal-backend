import express from "express";
import {
  uploadEntryImage,
  uploadReviewImage,
  deleteEntryImage,
  deleteReviewImage,
} from "../controllers/tradeImagesController.js";

import { protect } from "../middleware/auth.js";
import { requireActiveAccount } from "../middleware/activeAccount.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.use(protect);
router.use(requireActiveAccount);

// ==========================
// SUBIDAS
// ==========================
router.post(
  "/trades/:id/entry-image",
  upload.single("image"),
  uploadEntryImage,
);

router.post(
  "/trades/:id/review-image",
  upload.single("image"),
  uploadReviewImage,
);

// ==========================
// BORRADOS
// ==========================
router.delete("/trades/:id/entry-image", deleteEntryImage);
router.delete("/trades/:id/review-image", deleteReviewImage);

export default router;
