import Trade from "../models/Trade.js";

// =======================
// CREATE
// =======================
export const createTrade = async (req, res) => {
  try {
    const trade = await Trade.create({
      ...req.body,
      user: req.user._id,
      account: req.account._id, // 🔥 NOMBRE CORRECTO
    });

    res.status(201).json(trade);
  } catch (err) {
    console.error("CREATE TRADE ERROR:", err);
    res.status(400).json({ error: err.message });
  }
};

// =======================
// GET ALL (cuenta activa)
// =======================
export const getTrades = async (req, res) => {
  try {
    const trades = await Trade.find({
      user: req.user._id,
      account: req.account._id,
    }).sort({ entry_date: -1 });

    res.json(trades);
  } catch (err) {
    console.error("GET TRADES ERROR:", err);
    res.status(500).json({ error: "Failed to fetch trades" });
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
      tradingAccount: req.tradingAccount._id,
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
