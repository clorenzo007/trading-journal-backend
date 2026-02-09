import mongoose from "mongoose";
import TradingAccount from "../models/TradingAccount.js";

// =========================
// GET ACCOUNTS
// Fetches all trading accounts for the authenticated user.
// Ordered by creation date (newest first).
// =========================
export const getAccounts = async (req, res) => {
  try {
    const accounts = await TradingAccount.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });
    return res.json(accounts);
  } catch (err) {
    console.error("GET ACCOUNTS ERROR:", err);
    return res.status(500).json({ error: "Error fetching accounts" });
  }
};

// =========================
// CREATE ACCOUNT
// =========================
export const createAccount = async (req, res) => {
  try {
    const name = (req.body.name || "").trim();
    if (!name) return res.status(400).json({ error: "Name required" });

    const count = await TradingAccount.countDocuments({ userId: req.user.id });

    const creationDate = req.body.creationDate ? new Date(req.body.creationDate) : undefined;
    const meltingDate = req.body.meltingDate ? new Date(req.body.meltingDate) : undefined;

    const account = await TradingAccount.create({
      userId: req.user.id,
      name,
      accountType: req.body.accountType || "real",
      provider: req.body.provider,
      currency: req.body.currency || "USD",
      accountNumber: req.body.accountNumber,
      initialBalance: req.body.initialBalance || 0,
      creationDate,
      meltingDate,
      status: count === 0 ? "active" : "inactive", // 🔥 clave
    });

    return res.json(account);
  } catch (err) {
    console.error("CREATE ACCOUNT ERROR:", err);
    if (err?.code === 11000) {
      return res.status(400).json({ error: "Account already exists" });
    }
    return res.status(500).json({ error: err.message || "Error creating account" });
  }
};

// =========================
// ACTIVATE ACCOUNT (ATOMIC)
// =========================
export const activateAccount = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { id } = req.params;

    await session.withTransaction(async () => {
      await TradingAccount.updateMany(
        { userId: req.user.id },
        { $set: { status: "inactive" } },
        { session },
      );

      const updated = await TradingAccount.findOneAndUpdate(
        { _id: id, userId: req.user.id },
        { $set: { status: "active" } },
        { new: true, session },
      );

      if (!updated) throw new Error("Account not found");
    });

    const active = await TradingAccount.findOne({
      userId: req.user.id,
      status: "active",
    });

    return res.json(active);
  } catch (err) {
    console.error("ACTIVATE ERROR:", err);
    return res.status(500).json({ error: "Error activating account" });
  } finally {
    session.endSession();
  }
};

// =========================
// UPDATE ACCOUNT
// =========================
export const updateAccount = async (req, res) => {
  try {
    const { id } = req.params;

    const updates = { ...req.body };
    if (typeof updates.name === "string") updates.name = updates.name.trim();

    const updated = await TradingAccount.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { $set: updates },
      { new: true },
    );

    if (!updated) return res.status(404).json({ error: "Account not found" });

    return res.json(updated);
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(400).json({ error: "Account already exists" });
    }
    console.error("UPDATE ACCOUNT ERROR:", err);
    return res.status(500).json({ error: "Error updating account" });
  }
};

// =========================
// ARCHIVE ACCOUNT
// =========================
export const archiveAccount = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await TradingAccount.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { $set: { status: "archived" } },
      { new: true },
    );

    if (!updated) return res.status(404).json({ error: "Account not found" });

    return res.json(updated);
  } catch (err) {
    console.error("ARCHIVE ACCOUNT ERROR:", err);
    return res.status(500).json({ error: "Error archiving account" });
  }
};
