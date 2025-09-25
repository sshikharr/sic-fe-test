import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { getAgentColor } from "../utils/colors";

import "mapbox-gl/dist/mapbox-gl.css";

const MapboxPathfinding = () => {
  const mapContainerRef = useRef();
  const mapRef = useRef();
  const markersRef = useRef([]);

  const [agents, setAgents] = useState([]);
  const [agentPlacementMode, setAgentPlacementMode] = useState(false);
  const [pendingAgent, setPendingAgent] = useState(null);
  const [currentAgentNumber, setCurrentAgentNumber] = useState(1);
  const [simulation, setSimulation] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [mapError, setMapError] = useState(null);

  // Add marker to map
  const addMarker = React.useCallback((lng, lat, agentId, type, color) => {
    const markerElement = document.createElement("div");
    markerElement.className = "agent-marker";
    markerElement.style.cssText = `
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background-color: ${color};
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 12px;
      ${type === "end" ? "filter: brightness(0.8);" : ""}
      cursor: pointer;
      transition: transform 0.2s;
    `;

    markerElement.textContent = agentId;
    markerElement.addEventListener("mouseenter", () => {
      markerElement.style.transform = "scale(1.1)";
    });
    markerElement.addEventListener("mouseleave", () => {
      markerElement.style.transform = "scale(1)";
    });

    const marker = new mapboxgl.Marker(markerElement)
      .setLngLat([lng, lat])
      .addTo(mapRef.current);

    markersRef.current.push(marker);
    return marker;
  }, []);

  // Handle map clicks for agent placement
  const handleMapClick = React.useCallback(
    (e) => {
      if (!agentPlacementMode) return;

      const { lng, lat } = e.lngLat;

      if (!pendingAgent) {
        // Setting start point
        const newAgent = {
          id: currentAgentNumber,
          start: { lng, lat },
          end: null,
          color: getAgentColor(currentAgentNumber),
        };

        setPendingAgent(newAgent);

        // Add start marker
        addMarker(lng, lat, currentAgentNumber, "start", newAgent.color);
      } else {
        // Setting end point
        const updatedAgent = {
          ...pendingAgent,
          end: { lng, lat },
        };

        setAgents((prev) => [...prev, updatedAgent]);
        setPendingAgent(null);
        setCurrentAgentNumber((prev) => prev + 1);

        // Add end marker
        addMarker(lng, lat, updatedAgent.id, "end", updatedAgent.color);
      }
    },
    [agentPlacementMode, pendingAgent, currentAgentNumber, addMarker]
  );

  // Initialize Mapbox
  useEffect(() => {
    // Get token from environment variables
    const accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

    if (!accessToken || accessToken === "your_mapbox_access_token_here") {
      setMapError(
        "Mapbox access token is missing. Please add VITE_MAPBOX_ACCESS_TOKEN to your environment variables."
      );
      return;
    }

    setMapError(null);

    mapboxgl.accessToken = accessToken;

    try {
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [-74.006, 40.7128], // New York City
        zoom: 15,
        pitch: 0,
        bearing: 0,
      });

      // Add navigation controls
      mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-right");

      // Handle map clicks for agent placement
      mapRef.current.on("click", handleMapClick);

      // Wait for map to load before adding sources
      mapRef.current.on("load", initializeMapSources);
    } catch (error) {
      setMapError(`Failed to initialize map: ${error.message}`);
    }

    return () => {
      // Cleanup markers
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      // Remove map
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, [handleMapClick]);

  // Initialize map sources for paths
  const initializeMapSources = () => {
    // Add source for agent paths
    mapRef.current.addSource("agent-paths", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [],
      },
    });

    // Add layer for agent paths
    mapRef.current.addLayer({
      id: "agent-paths-layer",
      type: "line",
      source: "agent-paths",
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": ["get", "color"],
        "line-width": 3,
        "line-opacity": 0.8,
      },
    });

    // Add source for blocked paths
    mapRef.current.addSource("blocked-paths", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [],
      },
    });

    // Add layer for blocked paths
    mapRef.current.addLayer({
      id: "blocked-paths-layer",
      type: "line",
      source: "blocked-paths",
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": "#ef4444",
        "line-width": 2,
        "line-opacity": 0.8,
        "line-dasharray": [4, 2],
      },
    });
  };

  // Toggle agent placement mode
  const toggleAgentPlacementMode = () => {
    setAgentPlacementMode(!agentPlacementMode);
    setPendingAgent(null);
  };

  // Clear all agents
  const clearAllAgents = () => {
    setAgents([]);
    setPendingAgent(null);
    setCurrentAgentNumber(1);
    setSimulation(null);

    // Remove all markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Clear path layers
    if (mapRef.current?.getSource?.("agent-paths")) {
      mapRef.current.getSource("agent-paths").setData({
        type: "FeatureCollection",
        features: [],
      });
    }

    if (mapRef.current?.getSource?.("blocked-paths")) {
      mapRef.current.getSource("blocked-paths").setData({
        type: "FeatureCollection",
        features: [],
      });
    }
  };

  // Run pathfinding simulation
  const runSimulation = async () => {
    if (agents.length === 0) return;

    setIsRunning(true);

    try {
      // Use Mapbox Directions API for pathfinding
      const results = await Promise.all(
        agents.map(async (agent) => {
          if (!agent.start || !agent.end) return null;

          try {
            const response = await fetch(
              `https://api.mapbox.com/directions/v5/mapbox/walking/${agent.start.lng},${agent.start.lat};${agent.end.lng},${agent.end.lat}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`
            );

            if (!response.ok) {
              throw new Error(
                `Direction API responded with status: ${response.status}`
              );
            }

            const data = await response.json();

            if (data.routes && data.routes.length > 0) {
              return {
                agentId: agent.id,
                route: data.routes[0],
                path: data.routes[0].geometry,
                agent: agent,
              };
            } else {
              return {
                agentId: agent.id,
                route: null,
                path: null,
                agent: agent,
              };
            }
          } catch (error) {
            return {
              agentId: agent.id,
              route: null,
              path: null,
              agent: agent,
              error: error.message,
            };
          }
        })
      );

      setSimulation({ results: results.filter((r) => r !== null) });
      updatePathsOnMap(results.filter((r) => r !== null));
    } catch (error) {
      setMapError(`Simulation failed: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  // Update paths on map
  const updatePathsOnMap = (results) => {
    if (!mapRef.current) return;

    const successfulPaths = [];
    const blockedPaths = [];

    results.forEach((result) => {
      if (result.path && result.route) {
        // Successful path
        successfulPaths.push({
          type: "Feature",
          properties: {
            color: result.agent.color,
            agentId: result.agentId,
          },
          geometry: result.path,
        });
      } else {
        // Blocked path - draw straight line
        blockedPaths.push({
          type: "Feature",
          properties: {
            agentId: result.agentId,
          },
          geometry: {
            type: "LineString",
            coordinates: [
              [result.agent.start.lng, result.agent.start.lat],
              [result.agent.end.lng, result.agent.end.lat],
            ],
          },
        });
      }
    });

    // Update successful paths
    if (mapRef.current?.getSource?.("agent-paths")) {
      mapRef.current.getSource("agent-paths").setData({
        type: "FeatureCollection",
        features: successfulPaths,
      });
    }

    // Update blocked paths
    if (mapRef.current?.getSource?.("blocked-paths")) {
      mapRef.current.getSource("blocked-paths").setData({
        type: "FeatureCollection",
        features: blockedPaths,
      });
    }
  };

  return (
    <div className="w-full h-screen relative">
      {/* Error Display */}
      {mapError && (
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center z-50">
          <div className="bg-red-900 text-red-100 p-8 rounded-lg max-w-md mx-4 text-center">
            <h2 className="text-2xl font-bold mb-4">
              ⚠️ Map Configuration Required
            </h2>
            <p className="mb-6">{mapError}</p>
            <div className="bg-gray-800 p-4 rounded text-left text-sm">
              <p className="font-semibold mb-2">Steps to fix:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>
                  Get a free token from{" "}
                  <a
                    href="https://account.mapbox.com/access-tokens/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-300 underline"
                  >
                    Mapbox
                  </a>
                </li>
                <li>
                  Create a{" "}
                  <code className="bg-gray-700 px-1 rounded">.env</code> file in
                  the client folder
                </li>
                <li>
                  Add:{" "}
                  <code className="bg-gray-700 px-1 rounded">
                    VITE_MAPBOX_ACCESS_TOKEN=your_token_here
                  </code>
                </li>
                <li>Restart the development server</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Control Panel */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 space-y-3 z-10">
        <h3 className="font-semibold text-gray-800">Pathfinding Controls</h3>

        {/* Agent Placement */}
        <button
          onClick={toggleAgentPlacementMode}
          className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
            agentPlacementMode
              ? "bg-green-500 text-white hover:bg-green-600"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
        >
          {agentPlacementMode ? "✓ Placing Agents" : "+ Add Agent"}
        </button>

        {/* Status */}
        {agentPlacementMode && (
          <div className="text-sm text-center">
            {!pendingAgent ? (
              <span className="text-green-600 font-medium">
                🎯 Click to set Agent {currentAgentNumber} START
              </span>
            ) : (
              <span className="text-red-600 font-medium">
                🏁 Click to set Agent {currentAgentNumber} END
              </span>
            )}
          </div>
        )}

        {/* Agent Count */}
        <div className="text-sm text-gray-600 text-center">
          Agents: {agents.length}
        </div>

        {/* Run Simulation */}
        <button
          onClick={runSimulation}
          disabled={agents.length === 0 || isRunning}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isRunning ? "Finding Paths..." : "▶ Run Simulation"}
        </button>

        {/* Clear All */}
        <button
          onClick={clearAllAgents}
          className="w-full px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
        >
          🗑 Clear All
        </button>

        {/* Results */}
        {simulation && (
          <div className="text-sm space-y-1">
            <div className="font-medium text-gray-800">Results:</div>
            {simulation.results.map((result) => (
              <div
                key={result.agentId}
                className="flex items-center justify-between"
              >
                <span>Agent {result.agentId}:</span>
                <span
                  className={result.path ? "text-green-600" : "text-red-600"}
                >
                  {result.path ? "✓ Path Found" : "✗ Blocked"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 space-y-2 z-10">
        <h4 className="font-semibold text-gray-800">Legend</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow"></div>
            <span>Agent Start/End</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-1 bg-blue-500 rounded"></div>
            <span>Found Path</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-1 bg-red-500 rounded"
              style={{
                background:
                  "repeating-linear-gradient(to right, #ef4444 0, #ef4444 4px, transparent 4px, transparent 8px)",
              }}
            ></div>
            <span>Blocked Path</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapboxPathfinding;
