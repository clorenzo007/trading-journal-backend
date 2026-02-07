import express from "express";
import User from "../models/User.js";
import auth from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/admin.js";

const router = express.Router();

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

// eliminar usuario
router.delete("/users/:id", async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    return res.status(400).json({ error: "Cannot delete yourself" });
  }

  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });

  res.json({ message: "User deleted successfully" });
});

export default router;
