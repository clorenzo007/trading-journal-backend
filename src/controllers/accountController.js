import Account from "../models/Account.js";

// Crear cuenta
export const createAccount = async (req, res) => {
  try {
    const account = await Account.create({
      ...req.body,
      user: req.user._id,
    });

    res.status(201).json(account);
  } catch (err) {
    console.error("CREATE ACCOUNT ERROR:", err);
    res.status(400).json({ error: err.message });
  }
};

// Listar cuentas del usuario
export const getAccounts = async (req, res) => {
  try {
    const accounts = await Account.find({ user: req.user._id }).sort({
      createdAt: 1,
    });

    res.json(accounts);
  } catch (err) {
    console.error("GET ACCOUNTS ERROR:", err);
    res.status(500).json({ error: "Failed to fetch accounts" });
  }
};

// Actualizar cuenta
export const updateAccount = async (req, res) => {
  try {
    const account = await Account.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true },
    );

    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }

    res.json(account);
  } catch (err) {
    console.error("UPDATE ACCOUNT ERROR:", err);
    res.status(400).json({ error: err.message });
  }
};

// Archivar cuenta (soft delete)
export const archiveAccount = async (req, res) => {
  try {
    const account = await Account.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { status: "archived" },
      { new: true },
    );

    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }

    res.json(account);
  } catch (err) {
    console.error("ARCHIVE ACCOUNT ERROR:", err);
    res.status(400).json({ error: err.message });
  }
};
