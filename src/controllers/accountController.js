import Account from "../models/Account.js";

// GET ACCOUNTS
export async function getAccounts(req, res) {
  try {
    const accounts = await Account.find({ user: req.user._id });
    res.json(accounts);
  } catch (err) {
    console.error("GET ACCOUNTS ERROR:", err);
    res.status(500).json({ error: "Error fetching accounts" });
  }
}

// CREATE
export async function createAccount(req, res) {
  try {
    const account = await Account.create({
      name: req.body.name,
      type: req.body.type,
      balance: req.body.balance,
      user: req.user._id,
    });
    res.status(201).json(account);
  } catch (err) {
    console.error("CREATE ACCOUNT ERROR:", err);
    res.status(500).json({ error: "Error creating account" });
  }
}

// DELETE
export async function deleteAccount(req, res) {
  try {
    await Account.deleteOne({ _id: req.params.id, user: req.user._id });
    res.json({ ok: true });
  } catch (err) {
    console.error("DELETE ACCOUNT ERROR:", err);
    res.status(500).json({ error: "Error deleting account" });
  }
}
