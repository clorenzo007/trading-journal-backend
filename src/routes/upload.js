import express from "express";
import {
  uploadEntryImage,
  uploadReviewImage,
  deleteEntryImage,
  deleteReviewImage,
} from "../controllers/tradeImagesController.js";

import auth from "../middleware/authMiddleware.js"; // ✅ CORRECTO
import { requireActiveAccount } from "../middleware/activeAccount.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// ===========================================
// UPLOAD ROUTES (TRADES)
// Base Path: / (mounted at root)
// Requires: Auth + Active Account
// Note: These routes handle specific trade images.
// ===========================================
router.use(auth);
router.use(requireActiveAccount);

// ==========================
// UPLOADS
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
// DELETES
// ==========================
router.delete("/trades/:id/entry-image", deleteEntryImage);
router.delete("/trades/:id/review-image", deleteReviewImage);

export default router;
