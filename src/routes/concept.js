import express from "express";
import auth from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/admin.js";
import {
  getConcepts,
  createConcept,
  updateConcept,
  deleteConcept,
  uploadConceptImage,
  updateConceptsOrder,
} from "../controllers/conceptController.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// ===========================================
// CONCEPT ROUTES
// Base Path: /concepts
// Protected by `authMiddleware`
// ===========================================
router.use(auth);

router.get("/", getConcepts);

// Admin-only operations
router.post("/", requireAdmin, upload.array("files", 10), createConcept);
router.put("/order", requireAdmin, updateConceptsOrder);
router.put("/:id", requireAdmin, upload.array("files", 10), updateConcept);
router.delete("/:id", requireAdmin, deleteConcept);

// Upload images (append to existing)
router.post("/:id/image", requireAdmin, upload.array("files", 10), uploadConceptImage);

export default router;
