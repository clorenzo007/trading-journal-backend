import express from "express";
import auth from "../middleware/auth.js"; // ✅ DEFAULT IMPORT

import { register, login, getMe } from "../controllers/authController.js";

const router = express.Router();

// Públicas
router.post("/register", register);
router.post("/login", login);

// Privada
router.get("/me", getMe);

export default router;
