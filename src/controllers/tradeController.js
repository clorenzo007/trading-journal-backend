import Trade from "../models/Trade.js";

// =======================
// CREATE TRADE
// Creates a new trade for the authenticated user and active account.
// Requires `req.account` to be set by `activeAccount` middleware.
// =======================
export const createTrade = async (req, res) => {
  console.log("CREATE TRADE CONTROLLER - User:", req.user?._id, "Account:", req.account?._id);
  try {
    const trade = await Trade.create({
      ...req.body,
      user: req.user._id,
      account: req.account._id, // Scoped to active account
    });

    res.status(201).json(trade);
  } catch (err) {
    console.error("CREATE TRADE ERROR:", err);
    res.status(400).json({ error: err.message });
  }
};

// =======================
// GET ALL (ACTIVE ACCOUNT)
// =======================
export const getTrades = async (req, res) => {
  try {
    const trades = await Trade.find({
      user: req.user._id,
      account: req.account._id, // ✅ FIX
    }).sort({ entry_date: -1 });

    res.json(trades);
  } catch (err) {
    console.error("GET TRADES ERROR:", err);
    res.status(500).json({ error: "Failed to fetch trades" });
  }
};

// =======================
// GET ONE BY ID
// =======================
export const getTradeById = async (req, res) => {
  try {
    const trade = await Trade.findOne({
      _id: req.params.id,
      user: req.user._id,
      account: req.account._id, // ✅ FIX
    });

    if (!trade) {
      return res.status(404).json({ error: "Trade not found" });
    }

    res.json(trade);
  } catch (err) {
    console.error("GET TRADE BY ID ERROR:", err);
    res.status(500).json({ error: "Failed to fetch trade" });
  }
};

// =======================
// UPDATE
// =======================
export const updateTrade = async (req, res) => {
  try {
    const trade = await Trade.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
        account: req.account._id, // ✅ FIX
      },
      req.body,
      { new: true },
    );

    if (!trade) {
      return res.status(404).json({ error: "Trade not found" });
    }

    res.json(trade);
  } catch (err) {
    console.error("UPDATE TRADE ERROR:", err);
    res.status(400).json({ error: err.message });
  }
};

// =======================
// DELETE
// =======================
export const deleteTrade = async (req, res) => {
  try {
    const trade = await Trade.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
      account: req.account._id, // ✅ FIX
    });

    if (!trade) {
      return res.status(404).json({ error: "Trade not found" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("DELETE TRADE ERROR:", err);
    res.status(500).json({ error: "Failed to delete trade" });
  }
};
