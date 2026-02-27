import cloudinary from "../config/cloudinary.js";
import Concept from "../models/Concept.js";

// =========================
// GET ALL CONCEPTS (GLOBAL)
// Fetches all concepts for any authenticated user.
// Ordered by manually set order (1) and then creation date (-1).
// =========================
export const getConcepts = async (req, res) => {
  try {
    const concepts = await Concept.find({}).sort({ order: 1, createdAt: -1 });
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
      images: [], 
    };

    // Handle files if items is an array of strings in body it might need parsing
    if (typeof conceptData.items === 'string') {
      try {
        conceptData.items = JSON.parse(conceptData.items);
      } catch (e) {
        conceptData.items = [conceptData.items];
      }
    }

    // Handle Multiple Files
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => {
        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "concepts" },
            (error, result) => {
              if (error) reject(error);
              else resolve({
                url: result.secure_url,
                public_id: result.public_id
              });
            }
          );
          uploadStream.end(file.buffer);
        });
      });

      const uploadedImages = await Promise.all(uploadPromises);
      conceptData.images = uploadedImages;
      
      // Set the first image as the main "image" for backward compatibility if needed, 
      // or just rely on images array. Let's populate legacy field just in case.
      if (uploadedImages.length > 0) {
        conceptData.image = uploadedImages[0];
      }
    }

    const concept = new Concept(conceptData);
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
    let conceptData = { ...req.body };

    // Handle items parsing
    if (typeof conceptData.items === 'string') {
      try {
        conceptData.items = JSON.parse(conceptData.items);
      } catch (e) {
        conceptData.items = [conceptData.items];
      }
    }

    const originalConcept = await Concept.findOne({ _id: req.params.id });
    if (!originalConcept) return res.status(404).json({ error: "Concept not found" });

    // Handle New Files (Append)
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => {
        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "concepts" },
            (error, result) => {
              if (error) reject(error);
              else resolve({
                url: result.secure_url,
                public_id: result.public_id
              });
            }
          );
          uploadStream.end(file.buffer);
        });
      });

      const newImages = await Promise.all(uploadPromises);
      
      // Initialize images array if it doesn't exist (migration from legacy)
      let currentImages = originalConcept.images || [];
      
      // If images array is empty but legacy image exists, push it
      if (currentImages.length === 0 && originalConcept.image?.url) {
        currentImages.push(originalConcept.image);
      }

      // Combine
      conceptData.images = [...currentImages, ...newImages];
      
      // Update legacy field to latest or first? 
      // Let's keep legacy field as the *first* image, or user defined?
      // For now, just keep it in sync with the first image.
      if (conceptData.images.length > 0) {
        conceptData.image = conceptData.images[0];
      }
    }

    const updatedConcept = await Concept.findByIdAndUpdate(
      req.params.id,
      conceptData,
      { new: true }
    );

    res.json(updatedConcept);
  } catch (err) {
    console.error("UPDATE CONCEPT ERROR:", err);
    res.status(400).json({ error: err.message });
  }
};

// DELETE CONCEPT
export const deleteConcept = async (req, res) => {
  try {
    const concept = await Concept.findOne({ _id: req.params.id });
    if (!concept) return res.status(404).json({ error: "Concept not found" });

    // Collect all public_ids to delete
    const publicIds = [];
    if (concept.images && concept.images.length > 0) {
      concept.images.forEach(img => {
        if (img.public_id) publicIds.push(img.public_id);
      });
    } else if (concept.image?.public_id) {
      publicIds.push(concept.image.public_id);
    }

    // Delete from Cloudinary
    if (publicIds.length > 0) {
      const deletePromises = publicIds.map(id => cloudinary.uploader.destroy(id));
      await Promise.all(deletePromises);
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
    const concept = await Concept.findOne({ _id: req.params.id });
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
      Concept.findOneAndUpdate({ _id: id }, { order })
    );
    await Promise.all(promises);
    res.json({ success: true });
  } catch (err) {
    console.error("UPDATE CONCEPTS ORDER ERROR:", err);
    res.status(500).json({ error: "Failed to update order" });
  }
};
