import Trade from "../models/Trade.js";
import cloudinary from "../config/cloudinary.js";

// ==========================
// SUBIR IMAGEN DE ENTRADA
// ==========================
export const uploadEntryImage = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const trade = await Trade.findById(id);

    if (!trade) {
      return res.status(404).json({ error: "Trade not found" });
    }

    // Si ya había imagen, borrar la anterior
    if (trade.entryImage?.public_id) {
      await cloudinary.uploader.destroy(trade.entryImage.public_id);
    }

    trade.entryImage = {
      url: req.file.path,
      public_id: req.file.filename,
    };

    await trade.save();

    res.json(trade.entryImage);
  } catch (error) {
    console.error("UPLOAD ENTRY IMAGE ERROR:", error);
    res.status(500).json({ error: "Failed to upload entry image" });
  }
};

// ==========================
// SUBIR IMAGEN DE REVIEW
// ==========================
export const uploadReviewImage = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const trade = await Trade.findById(id);

    if (!trade) {
      return res.status(404).json({ error: "Trade not found" });
    }

    // Si ya había imagen, borrar la anterior
    if (trade.reviewImage?.public_id) {
      await cloudinary.uploader.destroy(trade.reviewImage.public_id);
    }

    trade.reviewImage = {
      url: req.file.path,
      public_id: req.file.filename,
    };

    await trade.save();

    res.json(trade.reviewImage);
  } catch (error) {
    console.error("UPLOAD REVIEW IMAGE ERROR:", error);
    res.status(500).json({ error: "Failed to upload review image" });
  }
};

// ==========================
// BORRAR IMAGEN DE ENTRADA
// ==========================
export const deleteEntryImage = async (req, res) => {
  try {
    const { id } = req.params;

    const trade = await Trade.findById(id);

    if (!trade) {
      return res.status(404).json({ error: "Trade not found" });
    }

    if (trade.entryImage?.public_id) {
      await cloudinary.uploader.destroy(trade.entryImage.public_id);
    }

    trade.entryImage = undefined;
    await trade.save();

    res.json({ success: true });
  } catch (error) {
    console.error("DELETE ENTRY IMAGE ERROR:", error);
    res.status(500).json({ error: "Failed to delete entry image" });
  }
};

// ==========================
// BORRAR IMAGEN DE REVIEW
// ==========================
export const deleteReviewImage = async (req, res) => {
  try {
    const { id } = req.params;

    const trade = await Trade.findById(id);

    if (!trade) {
      return res.status(404).json({ error: "Trade not found" });
    }

    if (trade.reviewImage?.public_id) {
      await cloudinary.uploader.destroy(trade.reviewImage.public_id);
    }

    trade.reviewImage = undefined;
    await trade.save();

    res.json({ success: true });
  } catch (error) {
    console.error("DELETE REVIEW IMAGE ERROR:", error);
    res.status(500).json({ error: "Failed to delete review image" });
  }
};
