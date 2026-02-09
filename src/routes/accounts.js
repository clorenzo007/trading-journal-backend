import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  getAccounts,
  createAccount,
  activateAccount,
  updateAccount,
  archiveAccount,
} from "../controllers/accountController.js";

const router = express.Router();

// ===========================================
// ACCOUNT ROUTES
// Base Path: /accounts
// All routes protected by `protect` middleware.
// ===========================================
router.get("/", protect, getAccounts);
router.post("/", protect, createAccount);
router.put("/:id/activate", protect, activateAccount);
router.put("/:id", protect, updateAccount);
router.patch("/:id/archive", protect, archiveAccount);

export default router;
