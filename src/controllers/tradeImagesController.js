import Trade from "../models/Trade.js";
import cloudinary from "../config/cloudinary.js";

// ================= ENTRY IMAGE UPLOAD =================
// Uploads an entry screenshot to Cloudinary ("trading-journal/entries").
// Deletes previous image if it exists to keep storage clean.
export const uploadEntryImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const result = await cloudinary.uploader.upload_stream(
      { folder: "trading-journal/entries" },
      async (error, uploaded) => {
        if (error) return res.status(500).json({ error: "Cloudinary error" });

        const trade = await Trade.findOne({
          _id: req.params.id,
          user: req.user._id,
        });

        if (!trade) return res.status(404).json({ error: "Trade not found" });

        // Delete old image if it exists
        if (trade.entryImage?.public_id) {
          try {
            await cloudinary.uploader.destroy(trade.entryImage.public_id);
          } catch (err) {
            console.error("OLD IMAGE DELETE ERROR:", err);
          }
        }

        trade.entryImage = {
          url: uploaded.secure_url,
          public_id: uploaded.public_id,
        };

        await trade.save();
        res.json(trade);
      },
    );

    result.end(req.file.buffer);
  } catch (err) {
    console.error("ENTRY UPLOAD ERROR:", err);
    res.status(500).json({ error: "Upload failed" });
  }
};

// ================= REVIEW IMAGE UPLOAD =================
export const uploadReviewImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const result = await cloudinary.uploader.upload_stream(
      { folder: "trading-journal/reviews" },
      async (error, uploaded) => {
        if (error) return res.status(500).json({ error: "Cloudinary error" });

        const trade = await Trade.findOne({
          _id: req.params.id,
          user: req.user._id,
        });

        if (!trade) return res.status(404).json({ error: "Trade not found" });

        // Delete old image if it exists
        if (trade.reviewImage?.public_id) {
          try {
            await cloudinary.uploader.destroy(trade.reviewImage.public_id);
          } catch (err) {
            console.error("OLD IMAGE DELETE ERROR:", err);
          }
        }

        trade.reviewImage = {
          url: uploaded.secure_url,
          public_id: uploaded.public_id,
        };

        await trade.save();
        res.json(trade);
      },
    );

    result.end(req.file.buffer);
  } catch (err) {
    console.error("REVIEW UPLOAD ERROR:", err);
    res.status(500).json({ error: "Upload failed" });
  }
};

// ================= DELETE ENTRY IMAGE =================
export const deleteEntryImage = async (req, res) => {
  try {
    const trade = await Trade.findOne({
      _id: req.params.id,
      user: req.user._id,
      account: req.account._id,
    });

    if (!trade || !trade.entryImage?.public_id)
      return res.status(404).json({ error: "No entry image found" });

    await cloudinary.uploader.destroy(trade.entryImage.public_id);

    trade.entryImage = undefined;
    await trade.save();

    res.json(trade);
  } catch (err) {
    console.error("DELETE ENTRY IMAGE ERROR:", err);
    res.status(500).json({ error: "Delete failed" });
  }
};

// ================= DELETE REVIEW IMAGE =================
export const deleteReviewImage = async (req, res) => {
  try {
    const trade = await Trade.findOne({
      _id: req.params.id,
      user: req.user._id,
      account: req.account._id,
    });

    if (!trade || !trade.reviewImage?.public_id)
      return res.status(404).json({ error: "No review image found" });

    await cloudinary.uploader.destroy(trade.reviewImage.public_id);

    trade.reviewImage = undefined;
    await trade.save();

    res.json(trade);
  } catch (err) {
    console.error("DELETE REVIEW IMAGE ERROR:", err);
    res.status(500).json({ error: "Delete failed" });
  }
};
