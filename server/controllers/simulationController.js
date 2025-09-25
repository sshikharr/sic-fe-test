const { findPath } = require("../utils/pathfinding");
const mapStore = require("../services/mapStore");

exports.runSimulation = (req, res) => {
  try {
    const { mapName, agents, sessionId } = req.body;

    // Validate input
    if (!mapName || !agents) {
      return res.status(400).json({ error: "Missing mapName or agents" });
    }

    // Get map data - use sessionId if exists, otherwise use original
    let mapData;
    if (sessionId && mapStore.sessions[sessionId]) {
      mapData = mapStore.sessions[sessionId];
    } else if (mapStore.originals[mapName]) {
      mapData = mapStore.originals[mapName];
    } else {
      return res.status(400).json({
        error: "Invalid map name",
        availableMaps: Object.keys(mapStore.originals),
      });
    }

    const results = [];

    agents.forEach((agent, index) => {
      try {
        // Validate start and end points are within bounds and on walkable paths
        const isValidPoint = (point) => {
          return (
            point.x >= 0 &&
            point.y >= 0 &&
            point.x < mapData[0].length &&
            point.y < mapData.length &&
            mapData[point.y][point.x] === 0 // Must be on walkable path (0), not wall (1)
          );
        };

        if (!isValidPoint(agent.start)) {
          results.push({
            agentId: index + 1,
            start: agent.start,
            end: agent.end,
            path: [],
            steps: 0,
            error: `Invalid start point: (${agent.start.x},${agent.start.y}) is out of bounds or on a wall`,
          });
          return;
        }

        if (!isValidPoint(agent.end)) {
          results.push({
            agentId: index + 1,
            start: agent.start,
            end: agent.end,
            path: [],
            steps: 0,
            error: `Invalid end point: (${agent.end.x},${agent.end.y}) is out of bounds or on a wall`,
          });
          return;
        }

        const path = findPath(mapData, agent.start, agent.end);

        results.push({
          agentId: index + 1,
          start: agent.start,
          end: agent.end,
          path,
          steps: path ? path.length : 0,
        });
      } catch (pathError) {
        console.error(`Pathfinding error for agent ${index + 1}:`, pathError);
        results.push({
          agentId: index + 1,
          start: agent.start,
          end: agent.end,
          path: [],
          steps: 0,
          error: pathError.message,
        });
      }
    });

    // Create congestion grid to track how many agents pass through each cell
    const congestionGrid = mapData.map((row) => row.map(() => 0));

    // Count agent paths through each cell
    results.forEach((result) => {
      if (result.path && result.path.length > 0) {
        result.path.forEach((point) => {
          if (
            point &&
            typeof point.x === "number" &&
            typeof point.y === "number"
          ) {
            congestionGrid[point.y][point.x]++;
          }
        });
      }
    });

    return res.json({
      success: true,
      map: mapName,
      totalAgents: agents.length,
      results,
      congestionGrid,
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
      stack: err.stack,
    });
  }
};

exports.updateMap = (req, res) => {
  try {
    const { mapName, sessionId, block } = req.body;

    if (!mapName || !sessionId || !block) {
      return res.status(400).json({
        error: "Missing required fields: mapName, sessionId, or block",
      });
    }

    if (!mapStore.originals[mapName]) {
      return res.status(404).json({ error: "Original map not found" });
    }

    // Get the current version of the map for this session
    // If no session map exists, create a deep copy from the original
    let currentMap = mapStore.sessions[sessionId];
    if (!currentMap) {
      currentMap = JSON.parse(JSON.stringify(mapStore.originals[mapName]));
    }

    if (
      block.y >= 0 &&
      block.y < currentMap.length &&
      block.x >= 0 &&
      block.x < currentMap[0].length
    ) {
      currentMap[block.y][block.x] = 1;
    } else {
      return res.status(400).json({ error: "Invalid coordinates" });
    }

    mapStore.sessions[sessionId] = currentMap;

    res.json({
      success: true,
      map: mapName,
      sessionId,
      updatedMap: currentMap,
    });
  } catch (error) {
    console.error("Error updating map:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getAvailableMaps = (req, res) => {
  try {
    const availableMaps = Object.keys(mapStore.originals);
    return res.json({
      success: true,
      maps: availableMaps,
    });
  } catch (error) {
    console.error("Error getting available maps:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.getMapData = (req, res) => {
  try {
    const { mapName, sessionId } = req.params;

    // Check if we have this map
    if (!mapStore.originals[mapName]) {
      return res.status(404).json({ error: "Map not found" });
    }

    // If sessionId is provided and exists, return the session-specific map
    if (sessionId && mapStore.sessions[sessionId]) {
      return res.json({
        success: true,
        mapName,
        sessionId,
        mapData: mapStore.sessions[sessionId],
      });
    }

    // Otherwise return the original map
    return res.json({
      success: true,
      mapName,
      mapData: mapStore.originals[mapName],
    });
  } catch (error) {
    console.error("Error getting map data:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
