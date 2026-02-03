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

    req.user = { id: user._id.toString(), role: user.role };
    next();
  } catch {
    return res.status(401).json({ error: "Not authorized" });
  }
};

export default protect; // ✅ DEFAULT
export { protect }; // ✅ named también, por compatibilidad
