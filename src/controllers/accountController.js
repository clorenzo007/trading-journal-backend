import TradingAccount from "../models/TradingAccount.js";

// CREATE
export const createAccount = async (req, res) => {
  try {
    const account = await TradingAccount.create({
      ...req.body,
      userId: req.user._id,
    });
    res.status(201).json(account);
  } catch (err) {
    console.error("CREATE ACCOUNT ERROR:", err);
    res.status(400).json({ error: err.message });
  }
};

// GET ALL
export const getAccounts = async (req, res) => {
  const accounts = await TradingAccount.find({ userId: req.user._id });
  res.json(accounts);
};
