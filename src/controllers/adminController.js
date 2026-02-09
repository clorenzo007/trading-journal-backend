import Strategy from "../models/Strategy.js";
import Pattern from "../models/Pattern.js";
import Setup from "../models/Setup.js";
import ListItem from "../models/ListItem.js";
import cloudinary from "../config/cloudinary.js";

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

export const updateSetupsOrder = async (req, res) => {
  try {
    const { orders } = req.body; // Array of { id, order }
    const promises = orders.map(({ id, order }) =>
      Setup.findOneAndUpdate({ _id: id, user: req.user._id }, { order })
    );
    await Promise.all(promises);
    res.json({ success: true });
  } catch (err) {
    console.error("UPDATE SETUPS ORDER ERROR:", err);
    res.status(500).json({ error: "Failed to update order" });
  }
};

// ==========================================
// GENERIC LIST ITEMS (Emotions, Reasons, etc.)
// ==========================================

export const getListItems = async (req, res) => {
  try {
    const { type } = req.params;
    const items = await ListItem.find({ user: req.user._id, type }).sort({ value: 1 });
    res.json(items);
  } catch (err) {
    console.error("GET LIST ITEMS ERROR:", err);
    res.status(500).json({ error: "Failed to fetch list items" });
  }
};

export const createListItem = async (req, res) => {
  try {
    const { type, value } = req.body;
    if (!type || !value) return res.status(400).json({ error: "Type and value are required" });

    const newItem = new ListItem({
      user: req.user._id,
      type,
      value,
    });
    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    console.error("CREATE LIST ITEM ERROR:", err);
    if (err.code === 11000) {
        return res.status(400).json({ error: "Item already exists" });
    }
    res.status(400).json({ error: err.message });
  }
};

export const deleteListItem = async (req, res) => {
  try {
    const item = await ListItem.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE LIST ITEM ERROR:", err);
    res.status(500).json({ error: "Failed to delete list item" });
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
