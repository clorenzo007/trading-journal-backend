import Trade from "../models/Trade.js";

// Crear trade
export const createTrade = async (req, res) => {
  try {
    const trade = await Trade.create({
      ...req.body,
      user: req.user._id,
      account: req.account._id,
    });

    res.status(201).json(trade);
  } catch (err) {
    console.error("CREATE TRADE ERROR:", err);
    res.status(400).json({ error: err.message });
  }
};

// Listar trades (por cuenta activa)
export const getTrades = async (req, res) => {
  try {
    const trades = await Trade.find({
      user: req.user._id,
      $or: [
        { account: req.account._id }, // nuevos
        { account: { $exists: false } }, // viejos
        { account: null }, // por si acaso
      ],
    }).sort({ entry_date: -1 });

    res.json(trades);
  } catch (err) {
    console.error("GET TRADES ERROR:", err);
    res.status(500).json({ error: "Failed to fetch trades" });
  }
};

// Obtener trade por ID
export const getTradeById = async (req, res) => {
  try {
    const trade = await Trade.findOne({
      _id: req.params.id,
      user: req.user._id,
      account: req.account._id,
    });

    if (!trade) {
      return res.status(404).json({ error: "Trade not found" });
    }

    res.json(trade);
  } catch (err) {
    console.error("GET TRADE ERROR:", err);
    res.status(500).json({ error: "Failed to fetch trade" });
  }
};

// Actualizar trade
export const updateTrade = async (req, res) => {
  try {
    const trade = await Trade.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
        account: req.account._id,
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

// Borrar trade
export const deleteTrade = async (req, res) => {
  try {
    const trade = await Trade.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
      account: req.account._id,
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
