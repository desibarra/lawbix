import express from "express";
import { supabase } from "../lib/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { error } = await supabase.from("users").select("id").limit(1);
    if (error) throw error;

    return res.status(200).json({
      ok: true,
      service: "lawbix backend",
      supabase: "connected",
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err.message
    });
  }
});

export default router;
