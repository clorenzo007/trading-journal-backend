import express from "express";
import { importMT5 } from "../controllers/importController.js";
import { protect } from "../middleware/auth.js";
import { requireActiveAccount } from "../middleware/activeAccount.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.use(protect);
router.use(requireActiveAccount);

// Override opcional: ?account=ID (ya lo maneja requireActiveAccount)
router.post("/mt5", upload.single("file"), importMT5);

export default router;
