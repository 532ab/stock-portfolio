const mongoose = require("mongoose");

const portfolioSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ticker: { type: String, required: true },
  quantity: { type: Number, required: true },
});

module.exports = mongoose.model("Portfolio", portfolioSchema);
