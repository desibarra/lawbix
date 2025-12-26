import express from "express";
import prisma from "../lib/prisma.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    // Determine database health by running a simple query
    await prisma.$queryRaw`SELECT 1`;

    return res.status(200).json({
      ok: true,
      service: "lawbix backend",
      database: "connected (mysql)",
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error("Health check failed:", err);
    return res.status(500).json({
      ok: false,
      error: "Database connection failed",
      details: err.message
    });
  }
});

export default router;
