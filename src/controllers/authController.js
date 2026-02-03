import TradingAccount from "../models/TradingAccount.js";

export const getAccounts = async (req, res) => {
  try {
    const accounts = await TradingAccount.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(accounts);
  } catch {
    res.status(500).json({ error: "Error fetching accounts" });
  }
};

export const createAccount = async (req, res) => {
  try {
    const exists = await TradingAccount.findOne({
      userId: req.user.id,
      name: req.body.name,
    });

    if (exists)
      return res.status(400).json({ error: "Account already exists" });

    const account = await TradingAccount.create({
      userId: req.user.id,
      name: req.body.name,
      provider: req.body.provider,
      currency: req.body.currency,
      accountNumber: req.body.accountNumber,
      initialBalance: req.body.initialBalance || 0,
      status: "inactive",
    });

    res.json(account);
  } catch {
    res.status(500).json({ error: "Error creating account" });
  }
};

export const activateAccount = async (req, res) => {
  try {
    const { id } = req.params;

    await TradingAccount.updateMany(
      { userId: req.user.id },
      { $set: { status: "inactive" } },
    );

    const updated = await TradingAccount.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { $set: { status: "active" } },
      { new: true },
    );

    res.json(updated);
  } catch {
    res.status(500).json({ error: "Error activating account" });
  }
};
