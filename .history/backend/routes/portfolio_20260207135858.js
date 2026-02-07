const express = require("express");
const router = express.Router();
const Portfolio = require("../models/portfolio.model");
const axios = require("axios");
const authMiddleware = require("../middleware/authMiddleware");

const ALPHA_VANTAGE_API_KEY = "YWFSAN4Q2XHJKK7J";

router.get("/", authMiddleware, async (req, res) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized: Missing userId" });

  try {
    const portfolio = await Portfolio.find({ userId: userId }); // userId already verified as string
    const results = await Promise.all(
      portfolio.map(async (stock) => {
        try {
          const response = await axios.get(
            `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stock.ticker}&apikey=${ALPHA_VANTAGE_API_KEY}`
          );

          const quote = response.data["Global Quote"] || {};
          const price = parseFloat(quote["05. price"]) || 0;

          let changePercent = 0;
          if (quote["10. change percent"]) {
            changePercent = parseFloat(quote["10. change percent"].replace("%", "")) || 0;
          }

          return {
            ...stock.toObject(),
            price,
            changePercent,
            totalValue: price * stock.quantity,
          };
        } catch (err) {
          return {
            ...stock.toObject(),
            price: 0,
            changePercent: 0,
            totalValue: 0,
          };
        }
      })
    );

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load portfolio" });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized: Missing userId" });

  const { ticker, quantity } = req.body;

  if (!ticker || !quantity || quantity <= 0)
    return res.status(400).json({ error: "Invalid ticker or quantity" });

  try {
    let stock = await Portfolio.findOne({ userId: userId, ticker: ticker.toUpperCase() });

    if (stock) {
      stock.quantity += quantity;
      await stock.save();
    } else {
      stock = new Portfolio({ userId: userId, ticker: ticker.toUpperCase(), quantity });
      await stock.save();
    }

    res.status(201).json(stock);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save stock" });
  }
});

router.delete("/:ticker", authMiddleware, async (req, res) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized: Missing userId" });

  const ticker = req.params.ticker.toUpperCase();

  try {
    await Portfolio.deleteOne({ userId: userId, ticker });
    res.json({ message: "Stock deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete stock" });
  }
});

module.exports = router;
