import express from "express";
import {
  createAccount,
  getAccounts,
  updateAccount,
  archiveAccount,
} from "../controllers/accountController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.post("/", createAccount);
router.get("/", getAccounts);
router.put("/:id", updateAccount);
router.patch("/:id/archive", archiveAccount);

export default router;
