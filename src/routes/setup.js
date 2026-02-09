import express from "express";
import auth from "../middleware/authMiddleware.js";
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

router.get("/", getSetups);
router.post(
  "/",
  upload.fields([
    { name: "theoryImage", maxCount: 1 },
    { name: "exampleImage", maxCount: 1 },
  ]),
  createSetup
);
router.put("/order", updateSetupsOrder);
router.put("/:id", updateSetup);
router.delete("/:id", deleteSetup);

// Upload images
router.post("/:id/image/:field", upload.single("file"), uploadSetupImage);

export default router;
