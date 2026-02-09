import TradingAccount from "../models/TradingAccount.js";

/**
 * Middleware to ensure an active trading account is available.
 * 
 * 1. Checks for specific account ID in headers ("x-account-id") or query params.
 * 2. If valid ID provided, verifies it belongs to user and is active.
 * 3. If no ID, finds the first active account for the user.
 * 4. Attaches account to `req.account`.
 */
export const requireActiveAccount = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // specific account request
    const accountId = req.headers["x-account-id"] || req.query.account || null;

    let account;

    if (accountId) {
      account = await TradingAccount.findOne({
        _id: accountId,
        userId: userId,
        status: "active",
      });
    } else {
      // default: first active account
      account = await TradingAccount.findOne({
        userId: userId,
        status: "active",
      }).sort({ createdAt: 1 });
    }

    if (!account) {
      return res.status(400).json({ error: "No active account available" });
    }

    req.account = account;
    next();
  } catch (err) {
    console.error("ACTIVE ACCOUNT ERROR:", err);
    res.status(500).json({ error: "Failed to resolve active account" });
  }
};
