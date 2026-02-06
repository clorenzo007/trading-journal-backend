import mongoose from "mongoose";

const SetupSchema = new mongoose.Schema(
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
    type: {
      type: String,
      enum: ["Bullish", "Bearish"],
      required: true,
    },
    theoryImage: {
      url: String,
      public_id: String,
    },
    exampleImage: {
      url: String,
      public_id: String,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Setup", SetupSchema);
