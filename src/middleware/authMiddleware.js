import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect = async (req, res, next) => {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

    if (!token) return res.status(401).json({ error: "Not authorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ error: "Not authorized" });

    // 🔥 clave: siempre req.user.id
    req.user = { id: user._id.toString(), role: user.role, email: user.email };

    next();
  } catch (err) {
    return res.status(401).json({ error: "Not authorized" });
  }
};

export default protect; // ✅ para: import protect from "..."
export { protect }; // ✅ para: import { protect } from "..."
