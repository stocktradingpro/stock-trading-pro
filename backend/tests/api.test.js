const request = require("supertest");
const app = require("../src/app"); // Import app.js, not server.js

describe("Stock Trading Pro API", () => {
  jest.setTimeout(15000);
  
  describe("Health Check", () => {
    it("GET /health should return 200 OK", async () => {
      const response = await request(app).get("/health");
      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe("OK");
    });
  });

  describe("Stock Endpoint", () => {
    it("GET /api/v1/stocks/:symbol returns response", async () => {
      const response = await request(app).get("/api/v1/stocks/AAPL");
      expect(response.body.symbol).toBe("AAPL");
    });
  });

  describe("Crypto Endpoint", () => {
    it("GET /api/v1/crypto/:symbol returns response", async () => {
      const response = await request(app).get("/api/v1/crypto/BTC");
      expect(response.body.symbol).toBe("BTC");
    });
  });
});
