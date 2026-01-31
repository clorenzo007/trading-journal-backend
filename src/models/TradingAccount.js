import mongoose from "mongoose";

const tradingAccountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    accountTypeId: { type: mongoose.Schema.Types.ObjectId, ref: "AccountType" },
    name: String,
    provider: String,
    currency: String,
    accountNumber: String,
    initialBalance: Number,
  },
  { timestamps: true },
);

export default mongoose.model("TradingAccount", tradingAccountSchema);
