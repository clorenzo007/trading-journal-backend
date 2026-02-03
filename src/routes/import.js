import express from "express";
import { importMT5 } from "../controllers/importController.js";
import auth from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.use(auth);

// Override opcional: ?account=ID (ya lo maneja requireActiveAccount)
router.post("/mt5", upload.single("file"), importMT5);

export default router;
