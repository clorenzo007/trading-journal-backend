import Trade from "../models/Trade.js";
import cloudinary from "../config/cloudinary.js";

/* ===========================
   CRUD
=========================== */

export const createTrade = async (req, res) => {
  try {
    const trade = await Trade.create({
      ...req.body,
      user: req.user._id,
    });
    res.status(201).json(trade);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Error creating trade" });
  }
};

export const getTrades = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      symbol,
      outcome,
      reviewed,
      direction,
      strategy,
      pattern,
      dateFrom,
      dateTo,
      source,
    } = req.query;

    const query = { user: req.user._id };

    if (symbol) query.symbol = new RegExp(symbol, "i");
    if (outcome) query.outcome = outcome;
    if (strategy) query.strategy_type = strategy;
    if (pattern) query.pattern = pattern;
    if (source) query.source = source;

    if (reviewed === "true") query.reviewed = true;
    if (reviewed === "false") query.reviewed = false;

    if (dateFrom || dateTo) {
      query.entry_date = {};
      if (dateFrom) query.entry_date.$gte = new Date(dateFrom);
      if (dateTo) query.entry_date.$lte = new Date(dateTo);
    }

    const skip = (page - 1) * limit;

    const [trades, total] = await Promise.all([
      Trade.find(query)
        .sort({ entry_date: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Trade.countDocuments(query),
    ]);

    res.json({
      trades,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching trades" });
  }
};

export const getTradeById = async (req, res) => {
  try {
    const trade = await Trade.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!trade) {
      return res.status(404).json({ error: "Trade no encontrado" });
    }

    res.json(trade);
  } catch (err) {
    res.status(500).json({ error: "Error cargando trade" });
  }
};

export const deleteTrade = async (req, res) => {
  try {
    const trade = await Trade.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!trade) {
      return res.status(404).json({ error: "Trade no encontrado" });
    }

    // borrar imágenes en Cloudinary si existen
    if (trade.entryImage?.public_id) {
      await cloudinary.uploader.destroy(trade.entryImage.public_id);
    }

    if (trade.reviewImage?.public_id) {
      await cloudinary.uploader.destroy(trade.reviewImage.public_id);
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Error al borrar trade" });
  }
};

export const updateTrade = async (req, res) => {
  try {
    const trade = await Trade.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!trade) {
      return res.status(404).json({ error: "Trade no encontrado" });
    }

    Object.assign(trade, req.body);

    // Recalcular outcome automáticamente
    if (typeof trade.profit_loss === "number") {
      trade.outcome =
        trade.profit_loss > 0
          ? "Win"
          : trade.profit_loss < 0
          ? "Loss"
          : "Break-even";
    }

    await trade.save();
    res.json(trade);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error updating trade" });
  }
};

/* ===========================
   REVIEW
=========================== */

export const reviewTrade = async (req, res) => {
  try {
    const trade = await Trade.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!trade) {
      return res.status(404).json({ error: "Trade no encontrado" });
    }

    if (trade.reviewed) {
      return res.status(400).json({ error: "Este trade ya fue revisado" });
    }

    trade.reviewed = true;
    trade.review = {
      ...req.body,
      createdAt: new Date(),
    };

    await trade.save();

    res.json(trade);
  } catch (err) {
    res.status(500).json({ error: "Error guardando review" });
  }
};

/* ===========================
   ENTRY IMAGE
=========================== */
console.log("Cloudinary upload starting...");

export const uploadEntryImage = async (req, res) => {
  try {
    const trade = await Trade.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!trade) {
      return res.status(404).json({ error: "Trade no encontrado" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No se envió ninguna imagen" });
    }

    if (trade.entryImage?.public_id) {
      await cloudinary.uploader.destroy(trade.entryImage.public_id);
    }

    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "trades/entry",
    });
    console.log("Cloudinary result:", result.secure_url);

    trade.entryImage = {
      url: result.secure_url,
      public_id: result.public_id,
    };

    await trade.save();

    res.json(trade);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error subiendo imagen de entrada" });
  }
};

/* ===========================
   REVIEW IMAGE
=========================== */

export const uploadReviewImage = async (req, res) => {
  try {
    const trade = await Trade.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!trade) {
      return res.status(404).json({ error: "Trade no encontrado" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No se envió ninguna imagen" });
    }

    if (trade.reviewImage?.public_id) {
      await cloudinary.uploader.destroy(trade.reviewImage.public_id);
    }

    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "trades/review",
    });
    console.log("Cloudinary result:", result.secure_url);
    trade.reviewImage = {
      url: result.secure_url,
      public_id: result.public_id,
    };

    await trade.save();

    res.json(trade);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error subiendo imagen de review" });
  }
};

/* ===========================
   DELETE ENTRY IMAGE
=========================== */

export const deleteEntryImage = async (req, res) => {
  try {
    const trade = await Trade.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!trade) {
      return res.status(404).json({ error: "Trade no encontrado" });
    }

    if (!trade.entryImage?.public_id) {
      return res.status(400).json({ error: "No hay imagen para borrar" });
    }

    await cloudinary.uploader.destroy(trade.entryImage.public_id);

    trade.entryImage = undefined;
    await trade.save();

    res.json(trade);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error borrando imagen de entrada" });
  }
};

/* ===========================
   DELETE REVIEW IMAGE
=========================== */

export const deleteReviewImage = async (req, res) => {
  try {
    const trade = await Trade.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!trade) {
      return res.status(404).json({ error: "Trade no encontrado" });
    }

    if (!trade.reviewImage?.public_id) {
      return res.status(400).json({ error: "No hay imagen para borrar" });
    }

    await cloudinary.uploader.destroy(trade.reviewImage.public_id);

    trade.reviewImage = undefined;
    await trade.save();

    res.json(trade);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error borrando imagen de review" });
  }
};
