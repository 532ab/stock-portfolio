const express = require("express");
const axios = require("axios");
const router = express.Router();

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || "d1t74k9r01qh0t057ov0d1t74k9r01qh0t057ovg";

// Simple in-memory cache
const cache = {};
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

// Generate realistic mock stock data (fallback)
function generateMockChartData(symbol) {
  const data = [];
  const today = new Date();
  let price = 100 + Math.random() * 200;
  
  for (let i = 60; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
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
    
    // Check cache first
    if (cache[symbol] && Date.now() - cache[symbol].timestamp < CACHE_DURATION) {
      console.log(`Cache hit for ${symbol}`);
      return res.json(cache[symbol].data);
    }
    
    // Fetch from Finnhub
    console.log(`Fetching ${symbol} from Finnhub API...`);
    const response = await axios.get(
      `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=D&count=60&token=${FINNHUB_API_KEY}`
    );

    if (!response.data.o || response.data.o.length === 0) {
      console.log(`No data for ${symbol}, using mock data`);
      const mockData = generateMockChartData(symbol);
      cache[symbol] = { data: mockData, timestamp: Date.now() };
      return res.json(mockData);
    }

    // Format Finnhub data
    const formattedData = response.data.t.map((timestamp, index) => ({
      date: new Date(timestamp * 1000).toISOString().split('T')[0],
      close: response.data.c[index]
    }));

    console.log(`Chart data fetched for ${symbol}:`, formattedData.length, "data points");
    
    // Cache the result
    cache[symbol] = { data: formattedData, timestamp: Date.now() };
    
    res.json(formattedData);
  } catch (error) {
    console.error("Error fetching chart data:", error.message);
    
    // Fallback to mock data on error
    console.log(`Using mock data as fallback for ${symbol}`);
    const mockData = generateMockChartData(symbol);
    cache[symbol] = { data: mockData, timestamp: Date.now() };
    
    res.json(mockData);
  }
});

module.exports = router;
