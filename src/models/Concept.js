import mongoose from "mongoose";

const ConceptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // The main title of the concept
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
      type: String,
      trim: true,
    },
    // Detailed explanation
    description: {
      type: String,
      trim: true,
    },
    // List of key points or bullet items
    items: [
      {
        type: String,
        trim: true,
      },
    ],
    // Additional notes
    note: {
      type: String,
      trim: true,
    },
    // Visual reference
    image: {
      url: String,
      public_id: String,
    },
    // Display order
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Concept", ConceptSchema);
