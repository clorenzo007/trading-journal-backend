import Trade from "../models/Trade.js";
import cloudinary from "../config/cloudinary.js";

export async function uploadEntryImage(req, res) {
  try {
    const trade = await Trade.findOne({
      _id: req.params.id,
      user: req.user._id,
      account: req.account._id,
    });

    if (!trade) {
      return res.status(404).json({ error: "Trade not found" });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "trades/entry",
    });

    trade.entryImage = {
      url: result.secure_url,
      public_id: result.public_id,
    };

    await trade.save();
    res.json(trade);
  } catch (err) {
    console.error("UPLOAD ENTRY IMAGE ERROR:", err);
    res.status(500).json({ error: "Upload failed" });
  }
}

export async function uploadReviewImage(req, res) {
  try {
    const trade = await Trade.findOne({
      _id: req.params.id,
      user: req.user._id,
      account: req.account._id,
    });

    if (!trade) {
      return res.status(404).json({ error: "Trade not found" });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "trades/review",
    });

    trade.reviewImage = {
      url: result.secure_url,
      public_id: result.public_id,
    };

    await trade.save();
    res.json(trade);
  } catch (err) {
    console.error("UPLOAD REVIEW IMAGE ERROR:", err);
    res.status(500).json({ error: "Upload failed" });
  }
}

export async function deleteEntryImage(req, res) {
  try {
    const trade = await Trade.findOne({
      _id: req.params.id,
      user: req.user._id,
      account: req.account._id,
    });

    if (!trade?.entryImage?.public_id) {
      return res.status(404).json({ error: "Image not found" });
    }

    await cloudinary.uploader.destroy(trade.entryImage.public_id);
    trade.entryImage = undefined;
    await trade.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
}

export async function deleteReviewImage(req, res) {
  try {
    const trade = await Trade.findOne({
      _id: req.params.id,
      user: req.user._id,
      account: req.account._id,
    });

    if (!trade?.reviewImage?.public_id) {
      return res.status(404).json({ error: "Image not found" });
    }

    await cloudinary.uploader.destroy(trade.reviewImage.public_id);
    trade.reviewImage = undefined;
    await trade.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
}
