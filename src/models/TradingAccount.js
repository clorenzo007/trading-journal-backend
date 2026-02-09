import mongoose from "mongoose";

const tradingAccountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    accountType: {
      type: String,
      enum: ["real", "demo", "fondeo"],
      default: "real",
    },

    accountTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AccountType",
    },

    name: { type: String, required: true, trim: true },

    // Key used to prevent duplicates (case-insensitive + trimmed)
    nameKey: { type: String, required: true, lowercase: true, trim: true },

    provider: String,
    currency: { type: String, default: "USD" },
    accountNumber: String,
    initialBalance: { type: Number, default: 0 },
    
    // Dates
    creationDate: { type: Date },
    meltingDate: { type: Date },

    status: {
      type: String,
      enum: ["active", "archived", "inactive"],
      default: "inactive",
    },
  },
  { timestamps: true },
);

// =========================================================================
// MIDDLEWARE: NORMALIZE NAME
// Ensures name is trimmed and nameKey is generated before validation.
// =========================================================================
tradingAccountSchema.pre("validate", function (next) {
  if (this.name) {
    this.name = this.name.trim();
    this.nameKey = this.name.trim().toLowerCase();
  }
  next();
});

// Prevent duplicate accounts for the same user (case-insensitive)
tradingAccountSchema.index({ userId: 1, nameKey: 1 }, { unique: true });

export default mongoose.model("TradingAccount", tradingAccountSchema);
