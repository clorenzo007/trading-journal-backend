import mongoose from "mongoose";

const ConceptSchema = new mongoose.Schema(
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
    subtitle: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    items: [
      {
        type: String,
        trim: true,
      },
    ],
    note: {
      type: String,
      trim: true,
    },
    image: {
      url: String,
      public_id: String,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Concept", ConceptSchema);
