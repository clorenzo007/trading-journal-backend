import express from "express";
import User from "../models/User.js";
import auth from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";

const router = express.Router();

router.use(auth);
router.use(requireAdmin);

// listar usuarios
router.get("/users", async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});

// activar / desactivar
router.patch("/users/:id/toggle", async (req, res) => {
  const user = await User.findById(req.params.id);
  user.active = !user.active;
  await user.save();
  res.json(user);
});

// cambiar rol
router.patch("/users/:id/role", async (req, res) => {
  const { role } = req.body;
  user.role = role;
  await user.save();
  res.json(user);
});

export default router;
