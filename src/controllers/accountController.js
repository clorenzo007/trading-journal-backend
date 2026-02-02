import TradingAccount from "../models/TradingAccount.js";

// =========================
// GET ACCOUNTS
// =========================
export const getAccounts = async (req, res) => {
  try {
    const accounts = await TradingAccount.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });

    res.json(accounts);
  } catch (err) {
    res.status(500).json({ error: "Error fetching accounts" });
  }
};

// =========================
// CREATE ACCOUNT
// =========================
export const createAccount = async (req, res) => {
  try {
    const account = await TradingAccount.create({
      userId: req.user.id,
      name: req.body.name,
      provider: req.body.provider,
      currency: req.body.currency,
      accountNumber: req.body.accountNumber,
      initialBalance: req.body.initialBalance || 0,
      status: "inactive", // 🔥 NUEVAS CUENTAS NO SE ACTIVAN SOLAS
    });

    res.json(account);
  } catch (err) {
    res.status(500).json({ error: "Error creating account" });
  }
};

// =========================
// 🔥 ACTIVATE ACCOUNT (FIX)
// =========================
export const activateAccount = async (req, res) => {
  try {
    const { id } = req.params;

    // Desactivar todas las cuentas del usuario
    await TradingAccount.updateMany(
      { userId: req.user.id },
      { $set: { status: "inactive" } },
    );

    // Activar la seleccionada
    const updated = await TradingAccount.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { $set: { status: "active" } },
      { new: true },
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Error activating account" });
  }
};
