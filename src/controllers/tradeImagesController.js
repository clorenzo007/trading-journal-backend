import Trade from "../models/Trade.js";
import cloudinary from "../config/cloudinary.js";

async function uploadToCloudinary(file) {
  if (!file) throw new Error("No file received");

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "trades" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );

    stream.end(file.buffer);
  });
}

// ================= ENTRY =================
export const uploadEntryImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Image file missing" });

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
    res.status(500).json({ error: err.message });
  }
};

// ================= REVIEW =================
export const uploadReviewImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Image file missing" });

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
    res.status(500).json({ error: err.message });
  }
};
