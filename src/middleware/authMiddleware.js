import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * Middleware to protect routes.
 * 
 * 1. Checks for "Authorization: Bearer <token>" header.
 * 2. Verifies the JWT token.
 * 3. Fetches the user from the database (excluding password).
 * 4. Attaches the user object to `req.user`.
 */
const protect = async (req, res, next) => {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

    if (!token) return res.status(401).json({ error: "Not authorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ error: "Not authorized" });
    if (user.active === false) {
      return res.status(403).json({ error: "User disabled" });
    }

    // Attach user to request object
    req.user = user;

    next();
  } catch (err) {
    return res.status(401).json({ error: "Not authorized" });
  }
};

export default protect; // ✅ para: import protect from "..."
export { protect }; // ✅ para: import { protect } from "..."
