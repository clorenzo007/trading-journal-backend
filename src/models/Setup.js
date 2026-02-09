import mongoose from "mongoose";

const SetupSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // The name of the setup (e.g., "Bull Flag")
    title: {
      type: String,
      required: true,
      trim: true,
    },
    // Detailed description of the setup criteria
    description: {
      type: String,
      trim: true,
    },
    // Directional bias
    type: {
      type: String,
      enum: ["Bullish", "Bearish"],
      required: true,
    },
    // Reference images
    theoryImage: {
      url: String,
      public_id: String,
    },
    exampleImage: {
      url: String,
      public_id: String,
    },
    // Sort order for display
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Setup", SetupSchema);
