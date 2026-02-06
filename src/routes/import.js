import express from "express";
import { importMT5 } from "../controllers/importController.js";
import auth from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";
import { requireActiveAccount } from "../middleware/activeAccount.js";

const router = express.Router();

router.use(auth);

// Import requires an active account (resolved from x-account-id or current active)
router.post("/mt5", requireActiveAccount, upload.single("file"), importMT5);

export default router;
