const express = require("express");
const {
  runSimulation,
  updateMap,
  getAvailableMaps,
  getMapData,
} = require("../controllers/simulationController");

const router = express.Router();

// POST /api/simulation/run
router.post("/run", runSimulation);
router.post("/update-map", updateMap);

// GET routes for maps
router.get("/maps", getAvailableMaps);
router.get("/maps/:mapName", getMapData);
router.get("/maps/:mapName/:sessionId", getMapData);

module.exports = router;
