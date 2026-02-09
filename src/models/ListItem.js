import mongoose from "mongoose";

const ListItemSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // The type of list (e.g., "reason_entry", "emotional_pre")
    type: {
      type: String,
      required: true,
      enum: ["emotional_pre", "emotional_post", "reason_entry", "reason_exit"],
      index: true,
    },
    // The actual value (e.g., "FOMO", "Pullback")
    value: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// Compound index to prevent duplicates per user and type
ListItemSchema.index({ user: 1, type: 1, value: 1 }, { unique: true });

export default mongoose.model("ListItem", ListItemSchema);
