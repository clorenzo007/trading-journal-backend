import mongoose from "mongoose";

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
    provider: String,
    currency: { type: String, default: "USD" },
    accountNumber: String,
    initialBalance: { type: Number, default: 0 },

    // 🔥 ESTA ES LA CLAVE
    status: {
      type: String,
      enum: ["active", "archived", "inactive"],
      default: "inactive",
    },
  },
  { timestamps: true },
);

// 🔥 Evita duplicados por usuario + nombre
tradingAccountSchema.index({ userId: 1, name: 1 }, { unique: true });

export default mongoose.model("TradingAccount", tradingAccountSchema);
