const express = require("express");
const axios = require("axios");
const router = express.Router();

const ALPHA_VANTAGE_API_KEY = "YWFSAN4Q2XHJKK7J";

// Generate realistic mock stock data
function generateMockChartData(symbol) {
  const data = [];
  const today = new Date();
  let price = 100 + Math.random() * 200; // Random starting price between 100-300
  
  // Generate 60 days of data
  for (let i = 60; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Realistic price movement (±2% daily)
    const change = (Math.random() - 0.5) * 4;
    price = Math.max(price * (1 + change / 100), 1);
    
    data.push({
      date: date.toISOString().split('T')[0],
      close: parseFloat(price.toFixed(2))
    });
  }
  
  return data;
}

router.get("/stock-prices", async (req, res) => {
  const { symbol } = req.query;

  if (!symbol) return res.status(400).json({ error: "Symbol is required" });

  try {
    console.log("Fetching chart data for symbol:", symbol);
    
    // Use mock data instead of API
    const formattedData = generateMockChartData(symbol);
    
    console.log(`Chart data generated for ${symbol}:`, formattedData.length, "data points");
    console.log("First 3 data points:", formattedData.slice(0, 3));
    
    res.json(formattedData);
  } catch (error) {
    console.error("Error generating chart data:", error);
    res.status(500).json({ error: `Failed to fetch stock prices: ${error.message}` });
  }
});

module.exports = router;
