import express from "express";
import auth from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/admin.js";
import {
  getSetups,
  createSetup,
  updateSetup,
  deleteSetup,
  uploadSetupImage,
  updateSetupsOrder,
} from "../controllers/setupController.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// ===========================================
// SETUP ROUTES
// Base Path: /setups
// Protected by `authMiddleware`
// ===========================================
router.use(auth);

// Publicly visible to all authenticated users
router.get("/", getSetups);

// Admin-only operations
router.post(
  "/",
  requireAdmin,
  upload.fields([
    { name: "theoryImage", maxCount: 1 },
    { name: "exampleImage", maxCount: 1 },
  ]),
  createSetup
);
router.put("/order", requireAdmin, updateSetupsOrder);
router.put("/:id", requireAdmin, updateSetup);
router.delete("/:id", requireAdmin, deleteSetup);

// Upload images
router.post("/:id/image/:field", requireAdmin, upload.single("file"), uploadSetupImage);

export default router;
