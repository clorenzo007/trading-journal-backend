import express from "express";
import auth from "../middleware/authMiddleware.js";
import {
  getSetups,
  createSetup,
  updateSetup,
  deleteSetup,
  uploadSetupImage,
} from "../controllers/setupController.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.use(auth);

router.get("/", getSetups);
router.post("/", createSetup);
router.put("/:id", updateSetup);
router.delete("/:id", deleteSetup);

// Upload images
router.post("/:id/image/:field", upload.single("file"), uploadSetupImage);

export default router;
