const mongoose = require("mongoose");

const TextSchema = new mongoose.Schema({
  content: { type: String, required: true },
  email: { type: String, default: "Guest" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Text", TextSchema);
