const app = require("./app");
const PORT = process.env.PORT || 3000;

// Only start server if not in test environment
if (process.env.NODE_ENV !== "test") {
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
}

module.exports = app;
