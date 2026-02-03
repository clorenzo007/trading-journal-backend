import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

function generateToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
}

// REGISTER
export const register = async (req, res) => {
  const { email, password } = req.body;

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ error: "User already exists" });

  const user = await User.create({
    email,
    password, // 🔥 SIN HASH
    role: "admin",
  });

  res.json({
    token: generateToken(user._id),
    user: {
      _id: user._id,
      email: user.email,
      role: user.role,
    },
  });
};

// LOGIN
export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ error: "Invalid credentials" });

  const ok = await user.comparePassword(password);

  if (!ok) return res.status(400).json({ error: "Invalid credentials" });

  res.json({
    token: generateToken(user._id),
    user: {
      _id: user._id,
      email: user.email,
      role: user.role, // 👈 ESTO FALTABA
    },
  });
};

// GET ME
export const getMe = async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.json(user);
};
