import express from "express";
import { importMT5 } from "../controllers/importController.js";
import auth from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";
import { requireActiveAccount } from "../middleware/activeAccount.js";

const router = express.Router();

router.use(auth);

// ===========================================
// IMPORT ROUTES
// Base Path: /import
// Requires: Auth + Active Account
// ===========================================
router.post("/mt5", requireActiveAccount, upload.single("file"), importMT5);

export default router;
