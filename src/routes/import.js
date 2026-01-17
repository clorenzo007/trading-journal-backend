import express from "express";
import { importMT5 } from "../controllers/importController.js";
import { protect } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.post("/mt5", protect, upload.single("file"), importMT5);

export default router;
