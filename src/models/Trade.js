import mongoose from "mongoose";

const TradeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    }
    
    // Identidad
    symbol: { type: String, required: true },
    strategy_type: { type: String, required: true },
    pattern: { type: String, required: true },

    // Entrada
    entry_date: { type: Date, required: true },
    entry_price: { type: Number, required: true },
    position_size: { type: Number, required: true },

    // Riesgo
    stop_loss: { type: Number, required: true },
    risk_percent: { type: Number, required: true },

    // Salida
    exit_date: { type: Date },
    exit_price: { type: Number },
    profit_loss: { type: Number },
    outcome: {
      type: String,
      enum: ["Win", "Loss", "Break-even"],
    },

    // Psicología pre
    emotional_state_pre: { type: String, required: true },
    reason_for_entry: { type: String, required: true },

    // Psicología post
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
    // SISTEMA DE REVIEW
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
    external_id: { type: String, index: true },
    source: { type: String, default: "manual" },
  },
  { timestamps: true }
);

export default mongoose.model("Trade", TradeSchema);
