import TradingAccount from "../models/TradingAccount.js";

export const requireActiveAccount = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const accountId = req.headers["x-account-id"] || req.query.account || null;

    let account;

    if (accountId) {
      account = await TradingAccount.findOne({
        _id: accountId,
        userId: userId,
        status: "active",
      });
    } else {
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
