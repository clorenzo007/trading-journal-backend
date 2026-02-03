import express from "express";
import {
  getAccounts,
  createAccount,
  activateAccount, // 🔥 FALTABA ESTO
} from "../controllers/accountController.js";

import auth from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔥 ACTIVAR CUENTA
router.patch("/:id/activate", auth, activateAccount);

// LISTAR
router.get("/", auth, getAccounts);

// CREAR (automáticamente deja solo 1 activa)
router.post("/", auth, createAccount);

export default router;
