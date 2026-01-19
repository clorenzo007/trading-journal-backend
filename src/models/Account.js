import mongoose from "mongoose";

const AccountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true, // ej: "FundingPips 10K"
    },

    provider: {
      type: String,
      required: true, // FTMO, FundingPips, Deriv, etc
    },

    accountType: {
      type: String,
      enum: ["real", "fondeo", "demo"],
      required: true,
    },

    accountNumber: {
      type: String,
      required: true,
    },

    currency: {
      type: String,
      default: "USD",
    },

    initialBalance: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["active", "paused", "archived"],
      default: "active",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Account", AccountSchema);
