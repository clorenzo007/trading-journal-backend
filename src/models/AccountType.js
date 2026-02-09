const mongoose = require("mongoose");

/**
 * AccountType Model
 * Defines the types of accounts available (e.g., Funded, Personal, Challenge).
 * Note: Uses CommonJS require syntax.
 */
const accountTypeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  status: { type: String, default: "active" },
});

module.exports = mongoose.model("AccountType", accountTypeSchema);
