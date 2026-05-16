import express from "express";
import User from "../models/User.js";
import auth from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/admin.js";
import {
  getStrategies,
  createStrategy,
  deleteStrategy,
  getPatterns,
  createPattern,
  deletePattern,
  getListItems,
  createListItem,
  updateListItem,
  deleteListItem,
  updateStrategy,
  updatePattern,
} from "../controllers/adminController.js";

const router = express.Router();

// ===========================================
// GLOBAL MIDDLEWARE
// 1. Authenticate user.
// 2. Enforce Admin role.
// ===========================================
router.use(auth);
router.use(requireAdmin);

// listar usuarios
router.get("/users", async (req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  res.json(users);
});

// activar / desactivar
router.patch("/users/:id/toggle", async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    return res.status(400).json({ error: "Cannot disable yourself" });
  }

  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });

  user.active = !user.active;
  await user.save();
  res.json(user);
});

// cambiar rol
router.patch("/users/:id/role", async (req, res) => {
  const { role } = req.body;
  if (!["admin", "user"].includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }

  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });

  user.role = role;
  await user.save();
  res.json(user);
});

// resetear contraseña (admin)
router.patch("/users/:id/password", async (req, res) => {
  const { password } = req.body;
  if (!password || password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });

  user.password = password; // pre-save hook will hash it
  await user.save();
  res.json({ message: "Password updated successfully" });
});

// eliminar usuario
router.delete("/users/:id", async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    return res.status(400).json({ error: "Cannot delete yourself" });
  }

  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });

  res.json({ message: "User deleted successfully" });
});

// ==========================
// STRATEGIES & PATTERNS
// ==========================
router.get("/strategies", getStrategies);
router.post("/strategies", createStrategy);
router.put("/strategies/:id", updateStrategy);
router.delete("/strategies/:id", deleteStrategy);

router.get("/patterns", getPatterns);
router.post("/patterns", createPattern);
router.put("/patterns/:id", updatePattern);
router.delete("/patterns/:id", deletePattern);

// ==========================
// LIST ITEMS (Emotions, Reasons)
// ==========================
router.get("/list-items/:type", getListItems);
router.post("/list-items", createListItem);
router.put("/list-items/:id", updateListItem);
router.delete("/list-items/:id", deleteListItem);

export default router;
