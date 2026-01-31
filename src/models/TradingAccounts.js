const mongoose = require("mongoose");

const tradingAccountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    accountTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AccountType",
    },

    name: { type: String, required: true },
    provider: { type: String, required: true },
    currency: { type: String, required: true },
    accountNumber: { type: String, required: true },
    initialBalance: { type: Number, required: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("TradingAccount", tradingAccountSchema);
