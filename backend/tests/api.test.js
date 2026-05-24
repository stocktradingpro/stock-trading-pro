const request = require("supertest");
const app = require("../src/server");

describe("Stock Trading Pro API", () => {
  describe("Health Check", () => {
    it("GET /health should return 200 OK with API status", async () => {
      const response = await request(app).get("/health");
      
      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe("OK");
      expect(response.body.apis).toBeDefined();
    });
  });

  describe("Stock Endpoint", () => {
    it("GET /api/v1/stocks/:symbol should return stock data or configuration message", async () => {
      const response = await request(app).get("/api/v1/stocks/AAPL");
      
      expect([200, 404]).toContain(response.statusCode);
      expect(response.body.symbol).toBe("AAPL");
    });
  });

  describe("Crypto Endpoint", () => {
    it("GET /api/v1/crypto/:symbol should return crypto data or configuration message", async () => {
      const response = await request(app).get("/api/v1/crypto/BTC");
      
      expect([200, 404]).toContain(response.statusCode);
      expect(response.body.symbol).toBe("BTC");
    });
  });

  describe("Error Handling", () => {
    it("Should return 404 for unknown routes", async () => {
      const response = await request(app).get("/unknown-route");
      
      expect(response.statusCode).toBe(404);
      expect(response.body.error).toBe("Not Found");
    });
  });
});
