import User from "../models/User.js";
import jwt from "jsonwebtoken";

/**
 * Generates a JWT token for the authenticated user.
 * Verified by `authMiddleware`.
 * @param {string} id - User ID
 */
function generateToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
}

// =========================
// REGISTER
// =========================
export const register = async (req, res) => {
  try {
    let { email, password } = req.body;

    email = (email || "").trim().toLowerCase();
    password = password || "";

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: "User already exists" });

    // 🔥 NO hashear acá (el model pre('save') lo hace)
    const user = await User.create({
      email,
      password,
      // role will default to "user" per the model definition
    });

    return res.json({
      token: generateToken(user._id),
      user: { _id: user._id, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// =========================
// LOGIN
// =========================
export const login = async (req, res) => {
  try {
    let { email, password } = req.body;

    email = (email || "").trim().toLowerCase();
    password = password || "";

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(400).json({ error: "Invalid credentials" });

    return res.json({
      token: generateToken(user._id),
      user: { _id: user._id, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// =========================
// GET ME
// =========================
export const getMe = async (req, res) => {
  try {
    // 🔥 nuestro middleware setea req.user.id
    const user = await User.findById(req.user.id).select("-password");
    return res.json(user);
  } catch (err) {
    console.error("GETME ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
