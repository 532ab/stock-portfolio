const express = require("express");
const axios = require("axios");
const router = express.Router();

const ALPHA_VANTAGE_API_KEY = "YWFSAN4Q2XHJKK7J";

router.get("/stock-prices", async (req, res) => {
  const { symbol } = req.query;

  if (!symbol) return res.status(400).json({ error: "Symbol is required" });

  try {
    console.log("Fetching chart data for symbol:", symbol);
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${symbol}&outputsize=compact&apikey=${ALPHA_VANTAGE_API_KEY}`;
    const response = await axios.get(url);

    const timeSeries = response.data["Time Series (Daily)"];
    if (!timeSeries) {
      console.error("No time series data in response:", response.data);
      return res.status(500).json({ error: "Invalid API response - no time series data" });
    }

    const formattedData = Object.entries(timeSeries)
      .map(([date, values]) => ({
        date,
        close: parseFloat(values["4. close"]),
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    console.log(`Chart data formatted for ${symbol}:`, formattedData.length, "data points");
    res.json(formattedData);
  } catch (error) {
    console.error("Error fetching chart data:", error.message);
    res.status(500).json({ error: `Failed to fetch stock prices: ${error.message}` });
  }
});

module.exports = router;
