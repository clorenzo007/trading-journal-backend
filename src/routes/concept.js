import express from "express";
import auth from "../middleware/authMiddleware.js";
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
router.post("/", upload.array("files", 10), createConcept);
router.put("/order", updateConceptsOrder);
// Update concept (now supports multiple file uploads)
router.put("/:id", upload.array("files", 10), updateConcept);
router.delete("/:id", deleteConcept);

// Upload images (append to existing)
router.post("/:id/image", upload.array("files", 10), uploadConceptImage);

export default router;
