const express = require("express");
const { analyzeLocation } = require("../controllers/geminiController");

const router = express.Router();

// POST /api/gemini/analyze-location
router.post("/analyze-location", analyzeLocation);

module.exports = router;