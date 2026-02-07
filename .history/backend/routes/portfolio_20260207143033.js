const express = require("express");
const router = express.Router();
const Portfolio = require("../models/portfolio.model");
const mongoose = require("mongoose");
const axios = require("axios");
const authMiddleware = require("../middleware/authMiddleware");

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || "YWFSAN4Q2XHJKK7J";
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || "d1t74k9r01qh0t057ov0d1t74k9r01qh0t057ovg";

router.get("/", authMiddleware, async (req, res) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized: Missing userId" });

  try {
    console.log("Fetching portfolio for userId:", userId);
    const portfolio = await Portfolio.find({ userId: new mongoose.Types.ObjectId(userId) });
    console.log("Portfolio found:", portfolio);
    
    const results = await Promise.all(
      portfolio.map(async (stock) => {
        try {
          // Try Finnhub first (more reliable)
          const finnhubResponse = await axios.get(
            `https://finnhub.io/api/v1/quote?symbol=${stock.ticker}&token=${FINNHUB_API_KEY}`,
            { timeout: 5000 }
          );
          
          const price = finnhubResponse.data?.c || stock.purchasePrice || 100;
          const changePercent = finnhubResponse.data?.dp || 0;

          const totalValue = price * stock.quantity;
          const costBasis = (stock.purchasePrice || price) * stock.quantity;
          const gainLoss = totalValue - costBasis;
          const gainLossPercent = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0;

          return {
            ...stock.toObject(),
            price,
            changePercent,
            totalValue,
            costBasis,
            gainLoss,
            gainLossPercent,
          };
        } catch (finnhubErr) {
          console.log("Finnhub failed for", stock.ticker, "trying Alpha Vantage...");
          
          try {
            const response = await axios.get(
              `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stock.ticker}&apikey=${ALPHA_VANTAGE_API_KEY}`,
              { timeout: 5000 }
            );

            const quote = response.data["Global Quote"] || {};
            const price = parseFloat(quote["05. price"]) || stock.purchasePrice || 100;

            let changePercent = 0;
            if (quote["10. change percent"]) {
              changePercent = parseFloat(quote["10. change percent"].replace("%", "")) || 0;
            }

            const totalValue = price * stock.quantity;
            const costBasis = (stock.purchasePrice || price) * stock.quantity;
            const gainLoss = totalValue - costBasis;
            const gainLossPercent = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0;

            return {
              ...stock.toObject(),
              price,
              changePercent,
              totalValue,
              costBasis,
              gainLoss,
              gainLossPercent,
            };
          } catch (alphaErr) {
            console.error("Both APIs failed for", stock.ticker);
            // Use purchasePrice as fallback
            const price = stock.purchasePrice || 100;
            const totalValue = price * stock.quantity;
            
            return {
              ...stock.toObject(),
              price,
              changePercent: 0,
              totalValue,
              costBasis: totalValue,
              gainLoss: 0,
              gainLossPercent: 0,
            };
          }
        }
      })
    );

    res.json(results);
  } catch (err) {
    console.error("Portfolio fetch error:", err);
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
    console.log("Adding stock for userId:", userId, "ticker:", ticker);
    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    // Fetch current price to use as purchase price
    let purchasePrice = 100; // Default fallback
    try {
      // Try Finnhub first
      const finnhubResponse = await axios.get(
        `https://finnhub.io/api/v1/quote?symbol=${ticker.toUpperCase()}&token=${FINNHUB_API_KEY}`,
        { timeout: 5000 }
      );
      purchasePrice = finnhubResponse.data?.c || 100;
      console.log("Got price from Finnhub:", purchasePrice);
    } catch (finnhubErr) {
      console.log("Finnhub failed, trying Alpha Vantage...");
      try {
        const response = await axios.get(
          `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker.toUpperCase()}&apikey=${ALPHA_VANTAGE_API_KEY}`,
          { timeout: 5000 }
        );
        const quote = response.data["Global Quote"] || {};
        purchasePrice = parseFloat(quote["05. price"]) || 100;
        console.log("Got price from Alpha Vantage:", purchasePrice);
      } catch (alphaErr) {
        console.log("Both APIs failed, using default price:", purchasePrice);
      }
    }
    
    let stock = await Portfolio.findOne({ userId: userObjectId, ticker: ticker.toUpperCase() });

    if (stock) {
      stock.quantity += quantity;
      // Update purchasePrice with weighted average
      const currentTotalValue = (stock.purchasePrice || purchasePrice) * (stock.quantity - quantity);
      const newValue = purchasePrice * quantity;
      stock.purchasePrice = (currentTotalValue + newValue) / stock.quantity;
      await stock.save();
      console.log("Stock quantity updated:", stock);
    } else {
      stock = new Portfolio({ 
        userId: userObjectId, 
        ticker: ticker.toUpperCase(), 
        quantity,
        purchasePrice
      });
      await stock.save();
      console.log("New stock created:", stock);
    }

    res.status(201).json(stock);
  } catch (err) {
    console.error("Portfolio post error:", err);
    res.status(500).json({ error: "Failed to save stock" });
  }
});

router.delete("/:ticker", authMiddleware, async (req, res) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized: Missing userId" });

  const ticker = req.params.ticker.toUpperCase();

  try {
    console.log("Deleting stock for userId:", userId, "ticker:", ticker);
    const userObjectId = new mongoose.Types.ObjectId(userId);
    await Portfolio.deleteOne({ userId: userObjectId, ticker });
    res.json({ message: "Stock deleted" });
  } catch (err) {
    console.error("Portfolio delete error:", err);
    res.status(500).json({ error: "Failed to delete stock" });
  }
});

module.exports = router;
