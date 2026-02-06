import cloudinary from "../config/cloudinary.js";
import Concept from "../models/Concept.js";

// GET ALL CONCEPTS FOR USER
// ... (rest of the controller remains the same)

// ... (other functions)

// UPLOAD CONCEPT IMAGE
export const uploadConceptImage = async (req, res) => {
  try {
    const concept = await Concept.findOne({ _id: req.params.id, user: req.user._id });
    if (!concept) return res.status(404).json({ error: "Concept not found" });

    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    // Delete old image if it exists
    if (concept.image?.public_id) {
      try {
        await cloudinary.uploader.destroy(concept.image.public_id);
      } catch (err) {
        console.error("OLD CONCEPT IMAGE DELETE ERROR:", err);
      }
    }

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "concepts" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );
      uploadStream.end(req.file.buffer);
    });

    concept.image = {
      url: result.secure_url,
      public_id: result.public_id,
    };

    await concept.save();
    res.json(concept);
  } catch (err) {
    console.error("UPLOAD CONCEPT IMAGE ERROR:", err);
    res.status(500).json({ error: "Failed to upload image" });
  }
};
