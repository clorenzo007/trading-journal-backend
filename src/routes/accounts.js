import express from "express";
import {
  getAccounts,
  createAccount,
} from "../controllers/accountController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/", auth, getAccounts);
router.post("/", auth, createAccount);
router.delete("/:id", auth, deleteAccount);

export default router;
