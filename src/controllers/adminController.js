import Strategy from "../models/Strategy.js";
import Pattern from "../models/Pattern.js";

// ==========================
// STRATEGIES
// ==========================
export const getStrategies = async (req, res) => {
  try {
    const items = await Strategy.find({ user: req.user._id }).sort({ title: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch strategies" });
  }
};

export const createStrategy = async (req, res) => {
  try {
    const { title, description } = req.body;
    const item = await Strategy.create({
      user: req.user._id,
      title,
      description,
    });
    res.status(201).json(item);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "Strategy already exists" });
    }
    res.status(500).json({ error: "Failed to create strategy" });
  }
};

export const deleteStrategy = async (req, res) => {
  try {
    await Strategy.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete strategy" });
  }
};

// ==========================
// PATTERNS
// ==========================
export const getPatterns = async (req, res) => {
  try {
    const items = await Pattern.find({ user: req.user._id }).sort({ title: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch patterns" });
  }
};

export const createPattern = async (req, res) => {
  try {
    const { title, description } = req.body;
    const item = await Pattern.create({
      user: req.user._id,
      title,
      description,
    });
    res.status(201).json(item);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "Pattern already exists" });
    }
    res.status(500).json({ error: "Failed to create pattern" });
  }
};

export const deletePattern = async (req, res) => {
  try {
    await Pattern.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete pattern" });
  }
};
