import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function StockChart({ symbol }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!symbol) return;

    async function fetchStockPrices() {
      setLoading(true);
      setError(null);
      try {
        console.log('Fetching chart data for:', symbol);
        const response = await axios.get(`/api/stock-prices?symbol=${symbol}`);
        console.log('Chart data received:', response.data);
        setData(response.data);
      } catch (err) {
        console.error("Failed to load stock prices:", err);
        setError(`Failed to load chart: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }

    fetchStockPrices();
  }, [symbol]);

  if (error) return <p style={{ color: '#fca5a5' }}>Error: {error}</p>;
  
  if (loading) return <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Loading chart data...</p>;

  if (!data.length) return <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>No chart data available for {symbol}.</p>;

  return (
    <div style={{ width: "100%", height: 400 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart 
          data={data} 
          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid 
            strokeDasharray="0" 
            stroke="rgba(255, 255, 255, 0.1)" 
            vertical={false}
          />
          <XAxis 
            dataKey="date" 
            stroke="rgba(255, 255, 255, 0.5)"
            tick={{ fontSize: 12 }}
            interval={Math.floor(data.length / 5)}
          />
          <YAxis 
            domain={["auto", "auto"]} 
            stroke="rgba(255, 255, 255, 0.5)"
            tick={{ fontSize: 12 }}
            width={50}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "8px",
              padding: "8px 12px",
            }}
            labelStyle={{ color: "white" }}
            formatter={(value) => `$${value.toFixed(2)}`}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Line 
            type="monotone" 
            dataKey="close" 
            stroke="#10b981" 
            strokeWidth={3}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
