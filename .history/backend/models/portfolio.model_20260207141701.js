const mongoose = require("mongoose");

const portfolioSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ticker: { type: String, required: true },
  quantity: { type: Number, required: true },
  purchasePrice: { type: Number, required: true }, // Price at which stock was added
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Portfolio", portfolioSchema);
