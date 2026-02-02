import TradingAccount from "../models/TradingAccount.js";

export const createAccount = async (req, res) => {
  try {
    const { name, provider, currency, accountNumber, initialBalance } =
      req.body;

    // 🔥 Desactivar todas las cuentas del usuario
    await TradingAccount.updateMany(
      { userId: req.user.id },
      { $set: { status: "archived" } },
    );

    const account = await TradingAccount.create({
      userId: req.user.id,
      name,
      provider,
      currency,
      accountNumber,
      initialBalance,
      status: "active",
    });

    res.status(201).json(account);
  } catch (err) {
    res.status(500).json({ error: "Error creating account" });
  }
};
