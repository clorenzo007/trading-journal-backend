const mongoose = require("mongoose");

const accountTypeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  status: { type: String, default: "active" },
});

module.exports = mongoose.model("AccountType", accountTypeSchema);
