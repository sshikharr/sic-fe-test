// server/server.js

require("dotenv").config();
const express = require("express");
const cors = require("cors");

const simulationRoutes = require("./routes/simulationRoutes");
const geminiRoutes = require("./routes/geminiRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/simulation", simulationRoutes);
app.use("/api/gemini", geminiRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});