import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { generateVerificationCode, sendVerificationCodeEmail } from "../utils/sendEmail.js";

const CODE_TTL_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Generates a JWT token for the authenticated user.
 * Verified by `authMiddleware`.
 * @param {string} id - User ID
 */
function generateToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
}

async function issueAndSendCode(user) {
  const code = generateVerificationCode();
  user.verificationCode = code;
  user.verificationCodeExpires = new Date(Date.now() + CODE_TTL_MS);
  await user.save();
  await sendVerificationCodeEmail(user.email, code);
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
      emailVerified: false,
      // role will default to "user" per the model definition
    });

    try {
      await issueAndSendCode(user);
    } catch (mailErr) {
      console.error("REGISTER: could not send verification email:", mailErr.message);
      // El usuario ya existe en la base; no lo dejamos colgado sin forma de
      // seguir — puede pedir que le reenvíen el código más tarde.
    }

    return res.json({
      needsVerification: true,
      email: user.email,
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// =========================
// VERIFY EMAIL
// =========================
export const verifyEmail = async (req, res) => {
  try {
    let { email, code } = req.body;
    email = (email || "").trim().toLowerCase();
    code = (code || "").trim();

    if (!email || !code) {
      return res.status(400).json({ error: "Email and code are required" });
    }

    const user = await User.findOne({ email }).select("+verificationCode +verificationCodeExpires");
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    if (user.emailVerified) {
      return res.json({
        token: generateToken(user._id),
        user: { _id: user._id, email: user.email, role: user.role },
      });
    }

    if (
      !user.verificationCode ||
      !user.verificationCodeExpires ||
      user.verificationCodeExpires.getTime() < Date.now()
    ) {
      return res.status(400).json({ error: "Code expired, request a new one" });
    }

    if (user.verificationCode !== code) {
      return res.status(400).json({ error: "Invalid code" });
    }

    user.emailVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpires = null;
    await user.save();

    return res.json({
      token: generateToken(user._id),
      user: { _id: user._id, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("VERIFY EMAIL ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// =========================
// RESEND VERIFICATION CODE
// =========================
export const resendVerificationCode = async (req, res) => {
  try {
    let { email } = req.body;
    email = (email || "").trim().toLowerCase();
    if (!email) return res.status(400).json({ error: "Email is required" });

    const user = await User.findOne({ email });
    // No revelamos si el email existe o no.
    if (!user || user.emailVerified) {
      return res.json({ ok: true });
    }

    await issueAndSendCode(user);
    return res.json({ ok: true });
  } catch (err) {
    console.error("RESEND CODE ERROR:", err);
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

    if (user.active === false) {
      return res.status(403).json({ error: "Tu usuario está desactivado. Contactá al administrador." });
    }

    if (!user.emailVerified) {
      return res.status(403).json({ error: "Email not verified", needsVerification: true, email: user.email });
    }

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
