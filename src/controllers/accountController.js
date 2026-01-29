import Account from "../models/Account.js";

/**
 * GET USER ACCOUNTS
 * Nunca bloquear si no tiene cuentas
 */
export const getAccounts = async (req, res) => {
  try {
    const userId = req.user.id;

    let accounts = await Account.find({ user: userId });

    // 🔥 SI NO TIENE CUENTAS → CREAR DEFAULT
    if (!accounts.length) {
      const defaultAccount = await Account.create({
        user: userId,
        name: "Default",
        type: "Demo",
        balance: 0,
        currency: "USD",
        status: "active",
      });

      accounts = [defaultAccount];
    }

    res.json(accounts);
  } catch (err) {
    console.error("GET ACCOUNTS ERROR:", err);
    res.status(500).json({ error: "Error fetching accounts" });
  }
};

/**
 * CREATE ACCOUNT
 */
export const createAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    const account = await Account.create({
      user: userId,
      name: req.body.name,
      type: req.body.type || "Demo",
      balance: req.body.balance || 0,
      currency: req.body.currency || "USD",
      status: "active",
    });

    res.status(201).json(account);
  } catch (err) {
    console.error("CREATE ACCOUNT ERROR:", err);
    res.status(500).json({ error: "Error creating account" });
  }
};

/**
 * DELETE ACCOUNT (soft delete)
 */
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const account = await Account.findOneAndUpdate(
      { _id: id, user: userId },
      { status: "deleted" },
      { new: true },
    );

    if (!account) return res.status(404).json({ error: "Account not found" });

    res.json({ message: "Account deleted" });
  } catch (err) {
    console.error("DELETE ACCOUNT ERROR:", err);
    res.status(500).json({ error: "Error deleting account" });
  }
};
