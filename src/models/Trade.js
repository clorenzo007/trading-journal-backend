import mongoose from "mongoose";

const TradeSchema = new mongoose.Schema(
  {
    // ===========================================
    // REFERENCES
    // Linking trade to specific user and account
    // ===========================================
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TradingAccount",
      required: true,
      index: true,
    },

    // ======================
    // IDENTIDAD
    // ======================
    symbol: { type: String, required: true },

    strategy_type: {
      type: String,
      default: "MT5 Import", // ✅ DEFAULT
    },

    pattern: {
      type: String,
      default: "N/A", // ✅ DEFAULT
    },

    // ======================
    // ENTRADA
    // ======================
    direction: {
      type: String,
      enum: ["Long", "Short"],
      default: "Long",
    },
    
    // Stored as STRING ISO 8601 (e.g. "2023-10-27T10:30") to preserve local time
    entry_date: { type: String, required: true },
    entry_price: { type: Number, required: true },
    position_size: { type: Number, required: true },

    // ======================
    // RIESGO
    // ======================
    // ======================
    // RIESGO
    // ======================
    stop_loss: { type: Number, required: true },
    take_profit: { type: Number }, // ✅ NEW
    risk_percent: { type: Number, required: true },
    highest_lowest_price: { type: Number }, // ✅ NEW: Price reached during trade

    // ======================
    // SALIDA
    // ======================
    // Stored as STRING ISO 8601
    exit_date: { type: String },
    exit_price: { type: Number },
    profit_loss: { type: Number },
    outcome: {
      type: String,
      enum: ["Win", "Loss", "Break-even"],
    },

    // ======================
    // PSICOLOGÍA (PRE)
    // ======================
    emotional_state_pre: {
      type: String,
      default: "Neutral", // ✅ DEFAULT
    },

    reason_for_entry: {
      type: String,
      default: "Imported from MT5", // ✅ DEFAULT
    },

    // ======================
    // PSICOLOGÍA (POST)
    // ======================
    emotional_state_post: { type: String },
    reason_for_exit: { type: String },
    review_notes: { type: String },

    // ======================
    // IMÁGENES
    // ======================
    entryImage: {
      url: String,
      public_id: String,
    },

    reviewImage: {
      url: String,
      public_id: String,
    },

    // ======================
    // REVIEW SYSTEM
    // ======================
    reviewed: {
      type: Boolean,
      default: false,
    },

    review: {
      score: { type: Number, min: 1, max: 5 },
      followedPlan: Boolean,
      ruleBroken: String,
      lesson: String,
      wouldRepeat: Boolean,
      createdAt: Date,
    },

    // ======================
    // IMPORT / EXTERNAL
    // ======================
    external_id: { type: String, index: true },
    source: { type: String, default: "manual" },
  },
  { timestamps: true },
);

export default mongoose.model("Trade", TradeSchema);
