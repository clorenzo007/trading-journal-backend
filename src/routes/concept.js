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

router.use(auth);

router.get("/", getConcepts);
router.post("/", upload.single("file"), createConcept);
router.put("/order", updateConceptsOrder);
router.put("/:id", updateConcept);
router.delete("/:id", deleteConcept);

// Upload images
router.post("/:id/image", upload.single("file"), uploadConceptImage);

export default router;
