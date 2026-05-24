const express = require("express");
require("dotenv").config();
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "Stock Trading Pro API",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0",
    uptime: process.uptime(),
    apis: {
      alphaVantage: process.env.API_KEY_ALPHAVANTAGE ? "Configured" : "Not configured",
      finnhub: process.env.API_KEY_FINNHUB ? "Configured" : "Not configured"
    }
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Stock Trading Pro API",
    version: "1.0.0",
    endpoints: {
      health: "GET /health",
      api: "GET /api/v1",
      stocks: "GET /api/v1/stocks/:symbol",
      crypto: "GET /api/v1/crypto/:symbol"
    },
    repository: "https://github.com/stocktradingpro/stock-trading-pro"
  });
});

// API v1 routes
app.get("/api/v1", (req, res) => {
  res.json({
    message: "Stock Trading API v1",
    availableEndpoints: [
      "GET    /api/v1/stocks/:symbol",
      "GET    /api/v1/crypto/:symbol",
      "POST   /api/v1/trade",
      "GET    /api/v1/portfolio",
      "GET    /api/v1/market-data"
    ],
    documentation: "https://github.com/stocktradingpro/stock-trading-pro"
  });
});

// REAL Stock data endpoint using Alpha Vantage
app.get("/api/v1/stocks/:symbol", async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  const apiKey = process.env.API_KEY_ALPHAVANTAGE;
  
  if (!apiKey || apiKey.includes("demo") || apiKey.includes("YOUR")) {
    return res.json({
      symbol,
      message: "Alpha Vantage API key not configured",
      note: "Add your real API_KEY_ALPHAVANTAGE in .env file",
      getKey: "https://www.alphavantage.co/support/#api-key"
    });
  }
  
  try {
    // Fetch real stock data from Alpha Vantage
    const response = await axios.get(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`
    );
    
    const data = response.data["Global Quote"];
    
    if (!data || data["01. symbol"] === "N/A") {
      return res.status(404).json({
        symbol,
        error: "Stock not found or invalid symbol",
        note: "Try symbols like: AAPL, MSFT, GOOGL, TSLA"
      });
    }
    
    res.json({
      symbol: data["01. symbol"],
      price: parseFloat(data["05. price"]),
      change: data["09. change"],
      changePercent: data["10. change percent"],
      volume: data["06. volume"],
      latestTradingDay: data["07. latest trading day"],
      api: "Alpha Vantage",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Alpha Vantage API error:", error.message);
    res.status(500).json({
      symbol,
      error: "Failed to fetch stock data",
      message: error.message,
      note: "Check your API key and network connection"
    });
  }
});

// REAL Crypto data endpoint using Finnhub
app.get("/api/v1/crypto/:symbol", async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  const apiKey = process.env.API_KEY_FINNHUB;
  
  if (!apiKey || apiKey.includes("demo") || apiKey.includes("YOUR")) {
    return res.json({
      symbol,
      message: "Finnhub API key not configured",
      note: "Add your real API_KEY_FINNHUB in .env file",
      getKey: "https://finnhub.io/register"
    });
  }
  
  try {
    // Fetch real crypto data from Finnhub
    const response = await axios.get(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`
    );
    
    const data = response.data;
    
    if (!data || data.c === 0) {
      return res.status(404).json({
        symbol,
        error: "Crypto not found or invalid symbol",
        note: "Try symbols like: BTC, ETH, BNB, ADA, SOL"
      });
    }
    
    res.json({
      symbol,
      currentPrice: data.c,
      highPrice: data.h,
      lowPrice: data.l,
      openPrice: data.o,
      previousClose: data.pc,
      timestamp: new Date(data.t * 1000).toISOString(),
      api: "Finnhub",
      note: "Prices in USD"
    });
  } catch (error) {
    console.error("Finnhub API error:", error.message);
    res.status(500).json({
      symbol,
      error: "Failed to fetch crypto data",
      message: error.message,
      note: "Check your API key and network connection"
    });
  }
});

// Portfolio endpoint (placeholder)
app.get("/api/v1/portfolio", (req, res) => {
  res.json({
    message: "Portfolio endpoint",
    note: "Implement portfolio management logic here",
    features: [
      "Track holdings",
      "Calculate profit/loss",
      "Generate reports",
      "Risk analysis"
    ]
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.method} ${req.url} not found`,
    availableRoutes: ["/", "/health", "/api/v1", "/api/v1/stocks/:symbol", "/api/v1/crypto/:symbol"]
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "development" ? err.message : "Something went wrong",
    timestamp: new Date().toISOString()
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log("╔══════════════════════════════════════════════════════════════╗");
  console.log("║               STOCK TRADING PRO API STARTED                 ║");
  console.log("╠══════════════════════════════════════════════════════════════╣");
  console.log(`║  Local:    http://localhost:${PORT}                         ║`);
  console.log(`║  Health:   http://localhost:${PORT}/health                  ║`);
  console.log(`║  Stocks:   http://localhost:${PORT}/api/v1/stocks/AAPL     ║`);
  console.log(`║  Crypto:   http://localhost:${PORT}/api/v1/crypto/BTC     ║`);
  console.log("║  GitHub:   https://github.com/stocktradingpro/stock-trading-pro ║");
  console.log("╚══════════════════════════════════════════════════════════════╝");
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log("Press Ctrl+C to stop the server");
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\nShutting down gracefully...");
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
});

module.exports = app;