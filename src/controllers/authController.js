import jwt from "jsonwebtoken";
import User from "../models/User.js";

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

export const register = async (req, res) => {
  try {
    const user = await User.create(req.body);
    const token = signToken(user._id);

    const safeUser = {
      _id: user._id,
      email: user.email,
      createdAt: user.createdAt,
    };

    res.status(201).json({ user: safeUser, token });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(400).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = signToken(user._id);
    const safeUser = {
      _id: user._id,
      email: user.email,
      createdAt: user.createdAt,
    };

    res.json({ user: safeUser, token });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ error: "Login failed" });
  }
};
