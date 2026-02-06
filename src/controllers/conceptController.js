import cloudinary from "../config/cloudinary.js";
import Concept from "../models/Concept.js";

// GET ALL CONCEPTS FOR USER
export const getConcepts = async (req, res) => {
  try {
    const concepts = await Concept.find({ user: req.user._id }).sort({ order: 1, createdAt: -1 });
    res.json(concepts);
  } catch (err) {
    console.error("GET CONCEPTS ERROR:", err);
    res.status(500).json({ error: "Failed to fetch concepts" });
  }
};

// CREATE CONCEPT
export const createConcept = async (req, res) => {
  try {
    const conceptData = {
      ...req.body,
      user: req.user._id,
    };

    // Handle files if items is an array of strings in body it might need parsing if it was sent as stringified json in multipart
    if (typeof conceptData.items === 'string') {
      try {
        conceptData.items = JSON.parse(conceptData.items);
      } catch (e) {
        conceptData.items = [conceptData.items];
      }
    }

    const concept = new Concept(conceptData);

    // If file is provided during creation
    if (req.file) {
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
    }

    await concept.save();
    res.status(201).json(concept);
  } catch (err) {
    console.error("CREATE CONCEPT ERROR:", err);
    res.status(400).json({ error: err.message });
  }
};

// UPDATE CONCEPT
export const updateConcept = async (req, res) => {
  try {
    const concept = await Concept.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!concept) return res.status(404).json({ error: "Concept not found" });
    res.json(concept);
  } catch (err) {
    console.error("UPDATE CONCEPT ERROR:", err);
    res.status(400).json({ error: err.message });
  }
};

// DELETE CONCEPT
export const deleteConcept = async (req, res) => {
  try {
    const concept = await Concept.findOne({ _id: req.params.id, user: req.user._id });
    if (!concept) return res.status(404).json({ error: "Concept not found" });

    // Delete image from Cloudinary if it exists
    if (concept.image?.public_id) {
      try {
        await cloudinary.uploader.destroy(concept.image.public_id);
      } catch (err) {
        console.error("DELETE CONCEPT IMAGE ERROR:", err);
      }
    }

    await Concept.deleteOne({ _id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE CONCEPT ERROR:", err);
    res.status(500).json({ error: "Failed to delete concept" });
  }
};

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

// UPDATE CONCEPTS ORDER
export const updateConceptsOrder = async (req, res) => {
  try {
    const { orders } = req.body; // Array of { id, order }
    const promises = orders.map(({ id, order }) =>
      Concept.findOneAndUpdate({ _id: id, user: req.user._id }, { order })
    );
    await Promise.all(promises);
    res.json({ success: true });
  } catch (err) {
    console.error("UPDATE CONCEPTS ORDER ERROR:", err);
    res.status(500).json({ error: "Failed to update order" });
  }
};
