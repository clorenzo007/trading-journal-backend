import mongoose from "mongoose";

const StrategySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Compound index to ensure unique titles per user
StrategySchema.index({ user: 1, title: 1 }, { unique: true });

export default mongoose.model("Strategy", StrategySchema);
