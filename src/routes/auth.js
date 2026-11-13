import express from "express";
import { register, login, getMe, verifyEmail, resendVerificationCode } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ===========================================
// AUTH ROUTES
// Base Path: /auth
// ===========================================
router.post("/register", register);
router.post("/verify-email", verifyEmail);
router.post("/resend-code", resendVerificationCode);
router.post("/login", login);
router.get("/me", protect, getMe);

export default router;
