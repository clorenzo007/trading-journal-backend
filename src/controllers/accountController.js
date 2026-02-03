import mongoose from "mongoose";
import TradingAccount from "../models/TradingAccount.js";

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

      if (!updated) {
        throw new Error("Account not found");
      }
    });

    // devolver la activa final desde DB
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
