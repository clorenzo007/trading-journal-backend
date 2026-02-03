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

    name: { type: String, required: true, trim: true },

    // 🔥 clave para evitar duplicados case/space-insensitive
    nameKey: { type: String, required: true, lowercase: true, trim: true },

    provider: String,
    currency: { type: String, default: "USD" },
    accountNumber: String,
    initialBalance: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["active", "archived", "inactive"],
      default: "inactive",
    },
  },
  { timestamps: true },
);

tradingAccountSchema.pre("validate", function (next) {
  if (this.name) {
    this.name = this.name.trim();
    this.nameKey = this.name.trim().toLowerCase();
  }
  next();
});

// 🔥 Evita duplicados por usuario + nombre normalizado
tradingAccountSchema.index({ userId: 1, nameKey: 1 }, { unique: true });

export default mongoose.model("TradingAccount", tradingAccountSchema);
