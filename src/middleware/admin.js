/**
 * Middleware to restrict access to Admins only.
 * Assumes `req.user` is already populated securely (e.g. by authMiddleware).
 */
export function requireAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}
