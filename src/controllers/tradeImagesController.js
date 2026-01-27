import Trade from "../models/Trade.js";
import cloudinary from "../config/cloudinary.js";

async function uploadToCloudinary(file) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "trades" }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      })
      .end(file.buffer);
  });
}

// ================= ENTRY IMAGE =================
export const uploadEntryImage = async (req, res) => {
  try {
    const trade = await Trade.findOne({
      _id: req.params.id,
      user: req.user._id,
      account: req.account._id,
    });

    if (!trade) return res.status(404).json({ error: "Trade not found" });

    const result = await uploadToCloudinary(req.file);

    trade.entryImage = {
      url: result.secure_url,
      public_id: result.public_id,
    };

    await trade.save();

    res.json(trade);
  } catch (err) {
    console.error("ENTRY IMAGE ERROR:", err);
    res.status(500).json({ error: "Upload failed" });
  }
};

// ================= REVIEW IMAGE =================
export const uploadReviewImage = async (req, res) => {
  try {
    const trade = await Trade.findOne({
      _id: req.params.id,
      user: req.user._id,
      account: req.account._id,
    });

    if (!trade) return res.status(404).json({ error: "Trade not found" });

    const result = await uploadToCloudinary(req.file);

    trade.reviewImage = {
      url: result.secure_url,
      public_id: result.public_id,
    };

    await trade.save();

    res.json(trade);
  } catch (err) {
    console.error("REVIEW IMAGE ERROR:", err);
    res.status(500).json({ error: "Upload failed" });
  }
};

// ================= DELETE =================
export const deleteEntryImage = async (req, res) => {
  try {
    const trade = await Trade.findById(req.params.id);
    if (!trade?.entryImage?.public_id)
      return res.status(404).json({ error: "No image" });

    await cloudinary.uploader.destroy(trade.entryImage.public_id);

    trade.entryImage = undefined;
    await trade.save();

    res.json(trade);
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
};

export const deleteReviewImage = async (req, res) => {
  try {
    const trade = await Trade.findById(req.params.id);
    if (!trade?.reviewImage?.public_id)
      return res.status(404).json({ error: "No image" });

    await cloudinary.uploader.destroy(trade.reviewImage.public_id);

    trade.reviewImage = undefined;
    await trade.save();

    res.json(trade);
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
};
