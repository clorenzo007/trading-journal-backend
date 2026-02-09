import mongoose from "mongoose";

/**
 * Establishes a connection to the MongoDB database.
 * 
 * Uses the MONGO_URI environment variable to connect.
 * Logs "MongoDB connected" on success.
 * Exits the process with code 1 on failure.
 */
export async function connectDB() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");
  } catch (err) {
    console.error("Mongo connection error:", err.message);
    process.exit(1);
  }
}
