import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import { getAgentColor } from "../utils/colors";
import MapLocationSearch from "./MapLocationSearch";
import LocationAnalysisPanel from "./LocationAnalysisPanel"; // Import the new component
import "leaflet/dist/leaflet.css";

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const FreeMapPathfinding = () => {
  const [agents, setAgents] = useState([]);
  const [agentPlacementMode, setAgentPlacementMode] = useState(false);
  const [pendingAgent, setPendingAgent] = useState(null);
  const [currentAgentNumber, setCurrentAgentNumber] = useState(1);
  const [paths, setPaths] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);
  const [currentLocationMarker, setCurrentLocationMarker] = useState(null);
  const [roadBlocks, setRoadBlocks] = useState([]);
  const [blockingMode, setBlockingMode] = useState(false);
  const [analysisMode, setAnalysisMode] = useState(false);
  const [analysisPoint, setAnalysisPoint] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
  const [selectedAgentAnalysis, setSelectedAgentAnalysis] = useState(null);
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Create custom marker icons for agents
  const createMarkerIcon = (color, number, type) => {
    const markerHtml = `
      <div style="
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background-color: ${color};
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 12px;
        color: white;
        text-shadow: 1px 1px 1px rgba(0,0,0,0.5);
      ">
        ${number}${type === "start" ? "S" : "E"}
      </div>
    `;

    return L.divIcon({
      html: markerHtml,
      className: "agent-marker",
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
  };

  // Handle location analysis
  const handleAnalyzeLocation = async (lat, lng) => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisPoint({ lat, lng });
    setAnalysisData(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/gemini/analyze-location`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ lat, lng }),
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Analysis request failed");
      }

      const result = await response.json();
      setAnalysisData(result.data);
    } catch (error) {
      setAnalysisError(error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearAnalysis = () => {
    setAnalysisMode(false);
    setAnalysisPoint(null);
    setAnalysisData(null);
    setAnalysisError(null);
  };

  // Component to handle map clicks
  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;

        if (analysisMode) {
          handleAnalyzeLocation(lat, lng);
          return;
        }

        if (blockingMode) {
          // Add road block
          const newBlock = {
            id: Date.now(),
            lat,
            lng,
            radius: 100, // 100 meter blocking radius for better coverage
          };

          // Clear existing paths immediately to prevent caching issues
          setPaths([]);

          setRoadBlocks((prev) => {
            const updatedBlocks = [...prev, newBlock];
            // Trigger dynamic recalculation immediately with cleared cache
            if (agents.length > 0) {
              setTimeout(() => dynamicRecalculate(updatedBlocks), 200);
            }
            return updatedBlocks;
          });
          return;
        }

        if (!agentPlacementMode) return;

        if (!pendingAgent) {
          // Create new agent with start position
          const newAgent = {
            id: currentAgentNumber,
            start: { lat, lng },
            end: null,
            color: getAgentColor(currentAgentNumber),
          };
          setPendingAgent(newAgent);
        } else {
          // Complete agent with end position
          const completedAgent = {
            ...pendingAgent,
            end: { lat, lng },
          };
          setAgents((prev) => [...prev, completedAgent]);
          setPendingAgent(null);
          setCurrentAgentNumber((prev) => prev + 1);
        }
      },
    });
    return null;
  };

  // Map reference handler
  const MapRefHandler = () => {
    const map = useMapEvents({});

    // Set map instance when component mounts
    useEffect(() => {
      if (map && !mapInstance) {
        setMapInstance(map);
      }
    }, [map]);

    return null;
  };

  // Check if a path intersects with any road blocks (comprehensive detection)
  const pathIntersectsBlocks = (coordinates, blocks = roadBlocks) => {
    if (blocks.length === 0) return false;

    let intersectionCount = 0;

    for (let block of blocks) {
      let blockIntersected = false;

      for (let i = 0; i < coordinates.length - 1; i++) {
        // Coordinates are already in [lat, lng] format from OSRM
        const start = { lat: coordinates[i][0], lng: coordinates[i][1] };
        const end = { lat: coordinates[i + 1][0], lng: coordinates[i + 1][1] };

        // Check multiple points along the line segment with very high precision
        const steps = Math.max(
          10,
          Math.ceil((calculateDistance(start, end) * 1000) / 5)
        ); // Every 5 meters

        for (let t = 0; t <= 1; t += 1 / steps) {
          const point = {
            lat: start.lat + t * (end.lat - start.lat),
            lng: start.lng + t * (end.lng - start.lng),
          };

          const distance = calculateDistance(point, {
            lat: block.lat,
            lng: block.lng,
          });
          // Convert distance to meters and compare with block radius
          if (distance * 1000 <= block.radius) {
            console.log(
              `🚫 Path blocked by block ${block.id} at ${block.lat.toFixed(
                6
              )}, ${block.lng.toFixed(6)} - distance: ${(
                distance * 1000
              ).toFixed(1)}m`
            );
            blockIntersected = true;
            break;
          }
        }

        if (blockIntersected) {
          intersectionCount++;
          break; // Move to next block
        }
      }
    }

    if (intersectionCount > 0) {
      console.log(
        `🚫 Total blocks intersected: ${intersectionCount}/${blocks.length}`
      );
      return true;
    }

    return false;
  };

  // Get real road-based routes using free OSRM API with road block avoidance
  const getRoadRoute = async (
    start,
    end,
    avoidBlocks = true,
    blocks = roadBlocks
  ) => {
    try {
      // Try primary route first
      let url = `https://router.project-osrm.org/route/v1/walking/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;

      let response = await fetch(url);
      let data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const coordinates = route.geometry.coordinates.map((coord) => [
          coord[1],
          coord[0],
        ]);

        // Check if route intersects with road blocks using the passed blocks array
        const isBlocked =
          avoidBlocks &&
          blocks.length > 0 &&
          pathIntersectsBlocks(coordinates, blocks);

        if (isBlocked) {
          console.log("🚫 Primary route is blocked, seeking alternatives...");
          // Try alternative route with waypoints to avoid blocks
          const alternatives = await getAlternativeRoutes(start, end, blocks);
          if (alternatives.length > 0) {
            console.log(
              `✅ Found ${alternatives.length} alternative routes, using best one`
            );
            return alternatives[0]; // Return best alternative
          } else {
            console.log(
              "⚠️ No OSRM alternatives found, trying aggressive detours..."
            );
            // Try more aggressive strategies when standard alternatives fail
            const aggressiveRoutes = await getAggressiveAlternatives(
              start,
              end,
              blocks
            );
            if (aggressiveRoutes.length > 0) {
              console.log(
                `✅ Found ${aggressiveRoutes.length} aggressive alternatives`
              );
              return aggressiveRoutes[0];
            } else {
              console.log(
                "❌ No alternative routes found, returning blocked route"
              );
              // Return blocked route marked as blocked
              return {
                path: coordinates,
                distance: route.distance / 1000,
                duration: Math.round(route.duration / 60),
                steps: route.legs[0]?.steps || [],
                blocked: true,
              };
            }
          }
        }

        return {
          path: coordinates,
          distance: route.distance / 1000,
          duration: Math.round(route.duration / 60),
          steps: route.legs[0]?.steps || [],
          blocked: false,
        };
      }

      // Fallback to straight line if routing fails
      return {
        path: [
          [start.lat, start.lng],
          [end.lat, end.lng],
        ],
        distance: calculateDistance(start, end),
        duration: Math.round(calculateDistance(start, end) * 12),
        steps: [],
        blocked: false,
      };
    } catch (error) {
      console.error("Routing error:", error);
      return {
        path: [
          [start.lat, start.lng],
          [end.lat, end.lng],
        ],
        distance: calculateDistance(start, end),
        duration: Math.round(calculateDistance(start, end) * 12),
        steps: [],
        blocked: false,
      };
    }
  };

  // Get multiple alternative routes using different strategies
  const getAlternativeRoutes = async (start, end, blocks = roadBlocks) => {
    const alternatives = [];

    // Strategy 1: Use OSRM alternatives API with multiple attempts
    try {
      // Try with more alternatives
      const altUrl = `https://router.project-osrm.org/route/v1/walking/${start.lng},${start.lat};${end.lng},${end.lat}?alternatives=5&overview=full&geometries=geojson`;
      const altResponse = await fetch(altUrl);
      const altData = await altResponse.json();

      if (altData.routes) {
        console.log(
          `📍 OSRM returned ${altData.routes.length} alternative routes`
        );
        for (let i = 0; i < altData.routes.length; i++) {
          const route = altData.routes[i];
          const coordinates = route.geometry.coordinates.map((coord) => [
            coord[1],
            coord[0],
          ]);
          const isBlocked = pathIntersectsBlocks(coordinates, blocks);

          console.log(
            `📍 Route ${i + 1}: ${isBlocked ? "🔴 BLOCKED" : "🟢 CLEAR"} - ${(
              route.distance / 1000
            ).toFixed(2)}km`
          );

          if (!isBlocked) {
            alternatives.push({
              path: coordinates,
              distance: route.distance / 1000,
              duration: Math.round(route.duration / 60),
              steps: route.legs[0]?.steps || [],
              blocked: false,
              type: "osrm_alternative",
            });
          }
        }
      }
    } catch (error) {
      console.log("OSRM alternatives failed:", error);
    }

    // Strategy 2: Generate diverse waypoints to avoid ALL blocked areas
    const generateWaypoints = () => {
      const waypoints = [];
      const midLat = (start.lat + end.lat) / 2;
      const midLng = (start.lng + end.lng) / 2;

      // Single waypoint strategies with varying distances
      const singleDirections = [
        { lat: 0.002, lng: 0.002 }, // Small North-East
        { lat: -0.002, lng: -0.002 }, // Small South-West
        { lat: 0.002, lng: -0.002 }, // Small North-West
        { lat: -0.002, lng: 0.002 }, // Small South-East
        { lat: 0.005, lng: 0 }, // Medium North
        { lat: -0.005, lng: 0 }, // Medium South
        { lat: 0, lng: 0.005 }, // Medium East
        { lat: 0, lng: -0.005 }, // Medium West
        { lat: 0.008, lng: 0.008 }, // Large North-East
        { lat: -0.008, lng: -0.008 }, // Large South-West
        { lat: 0.008, lng: -0.008 }, // Large North-West
        { lat: -0.008, lng: 0.008 }, // Large South-East
        { lat: 0.012, lng: 0 }, // Very Large North
        { lat: -0.012, lng: 0 }, // Very Large South
        { lat: 0, lng: 0.012 }, // Very Large East
        { lat: 0, lng: -0.012 }, // Very Large West
      ];

      // Add single waypoint routes
      for (let direction of singleDirections) {
        const waypoint = {
          lat: midLat + direction.lat,
          lng: midLng + direction.lng,
        };
        waypoints.push([waypoint]);
      }

      // Double waypoint strategies for complex blocks
      const doubleWaypoints = [
        [
          { lat: midLat + 0.006, lng: midLng + 0.003 },
          { lat: midLat + 0.003, lng: midLng + 0.006 },
        ],
        [
          { lat: midLat - 0.006, lng: midLng - 0.003 },
          { lat: midLat - 0.003, lng: midLng - 0.006 },
        ],
        [
          { lat: midLat + 0.006, lng: midLng - 0.003 },
          { lat: midLat + 0.003, lng: midLng - 0.006 },
        ],
        [
          { lat: midLat - 0.006, lng: midLng + 0.003 },
          { lat: midLat - 0.003, lng: midLng + 0.006 },
        ],
        [
          { lat: midLat + 0.01, lng: midLng },
          { lat: midLat, lng: midLng + 0.01 },
        ],
        [
          { lat: midLat - 0.01, lng: midLng },
          { lat: midLat, lng: midLng - 0.01 },
        ],
      ];

      waypoints.push(...doubleWaypoints);
      return waypoints;
    };

    const allWaypoints = generateWaypoints();

    for (let waypointSet of allWaypoints) {
      try {
        // Check if all waypoints are clear of blocks (less restrictive)
        let anyWaypointBlocked = false;
        for (let waypoint of waypointSet) {
          for (let block of blocks) {
            const distance = calculateDistance(waypoint, {
              lat: block.lat,
              lng: block.lng,
            });
            if (distance * 1000 < block.radius * 1.0) {
              // Reduced safety margin
              anyWaypointBlocked = true;
              break;
            }
          }
          if (anyWaypointBlocked) break;
        }

        if (anyWaypointBlocked) continue;

        // Build URL with all waypoints
        const coords = [
          `${start.lng},${start.lat}`,
          ...waypointSet.map((wp) => `${wp.lng},${wp.lat}`),
          `${end.lng},${end.lat}`,
        ].join(";");

        const url = `https://router.project-osrm.org/route/v1/walking/${coords}?overview=full&geometries=geojson`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const coordinates = route.geometry.coordinates.map((coord) => [
            coord[1],
            coord[0],
          ]);

          if (!pathIntersectsBlocks(coordinates, blocks)) {
            alternatives.push({
              path: coordinates,
              distance: route.distance / 1000,
              duration: Math.round(route.duration / 60),
              steps: route.legs[0]?.steps || [],
              blocked: false,
              type:
                waypointSet.length === 1 ? "single_waypoint" : "multi_waypoint",
            });
          }
        }
      } catch (error) {
        console.log("Waypoint route failed:", error);
      }
    }

    // Remove duplicates and sort by distance
    const uniqueAlternatives = alternatives.filter(
      (route, index, self) =>
        index ===
        self.findIndex((r) => Math.abs(r.distance - route.distance) < 0.1)
    );

    return uniqueAlternatives.sort((a, b) => a.distance - b.distance);
  };

  // Get aggressive alternative routes when standard alternatives fail
  const getAggressiveAlternatives = async (start, end, blocks = roadBlocks) => {
    const alternatives = [];
    console.log("🔥 Trying aggressive alternative routing strategies...");

    // Strategy 1: Very large detours in all directions
    const aggressiveDirections = [
      { lat: 0.02, lng: 0 }, // Very far North
      { lat: -0.02, lng: 0 }, // Very far South
      { lat: 0, lng: 0.02 }, // Very far East
      { lat: 0, lng: -0.02 }, // Very far West
      { lat: 0.015, lng: 0.015 }, // Very far North-East
      { lat: -0.015, lng: -0.015 }, // Very far South-West
      { lat: 0.015, lng: -0.015 }, // Very far North-West
      { lat: -0.015, lng: 0.015 }, // Very far South-East
      { lat: 0.03, lng: 0 }, // Extremely far North
      { lat: -0.03, lng: 0 }, // Extremely far South
      { lat: 0, lng: 0.03 }, // Extremely far East
      { lat: 0, lng: -0.03 }, // Extremely far West
    ];

    const midLat = (start.lat + end.lat) / 2;
    const midLng = (start.lng + end.lng) / 2;

    for (let direction of aggressiveDirections) {
      try {
        const waypoint = {
          lat: midLat + direction.lat,
          lng: midLng + direction.lng,
        };

        // Much more relaxed blocking check - only avoid very close blocks
        let waypointBlocked = false;
        for (let block of blocks) {
          const distance = calculateDistance(waypoint, {
            lat: block.lat,
            lng: block.lng,
          });
          if (distance * 1000 < block.radius * 0.8) {
            // Much smaller safety margin
            waypointBlocked = true;
            break;
          }
        }

        if (waypointBlocked) continue;

        const url = `https://router.project-osrm.org/route/v1/walking/${start.lng},${start.lat};${waypoint.lng},${waypoint.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const coordinates = route.geometry.coordinates.map((coord) => [
            coord[1],
            coord[0],
          ]);

          if (!pathIntersectsBlocks(coordinates, blocks)) {
            console.log(
              `🟢 Found aggressive alternative via waypoint (${waypoint.lat.toFixed(
                4
              )}, ${waypoint.lng.toFixed(4)})`
            );
            alternatives.push({
              path: coordinates,
              distance: route.distance / 1000,
              duration: Math.round(route.duration / 60),
              steps: route.legs[0]?.steps || [],
              blocked: false,
              type: "aggressive_detour",
            });
          }
        }
      } catch (error) {
        console.log("Aggressive waypoint route failed:", error);
      }
    }

    // Strategy 2: Multi-hop routes with multiple waypoints
    if (alternatives.length === 0) {
      console.log("🔥 Trying multi-hop aggressive routes...");
      const multiHopRoutes = [
        [
          { lat: midLat + 0.015, lng: midLng + 0.005 },
          { lat: midLat + 0.005, lng: midLng + 0.015 },
        ],
        [
          { lat: midLat - 0.015, lng: midLng - 0.005 },
          { lat: midLat - 0.005, lng: midLng - 0.015 },
        ],
        [
          { lat: midLat + 0.02, lng: midLng },
          { lat: midLat, lng: midLng + 0.02 },
        ],
        [
          { lat: midLat - 0.02, lng: midLng },
          { lat: midLat, lng: midLng - 0.02 },
        ],
      ];

      for (let waypointSet of multiHopRoutes) {
        try {
          // Check if waypoints are reasonably clear
          let anyWaypointBlocked = false;
          for (let waypoint of waypointSet) {
            for (let block of blocks) {
              const distance = calculateDistance(waypoint, {
                lat: block.lat,
                lng: block.lng,
              });
              if (distance * 1000 < block.radius * 0.5) {
                // Very relaxed check
                anyWaypointBlocked = true;
                break;
              }
            }
            if (anyWaypointBlocked) break;
          }

          if (anyWaypointBlocked) continue;

          const coords = [
            `${start.lng},${start.lat}`,
            ...waypointSet.map((wp) => `${wp.lng},${wp.lat}`),
            `${end.lng},${end.lat}`,
          ].join(";");

          const url = `https://router.project-osrm.org/route/v1/walking/${coords}?overview=full&geometries=geojson`;

          const response = await fetch(url);
          const data = await response.json();

          if (data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            const coordinates = route.geometry.coordinates.map((coord) => [
              coord[1],
              coord[0],
            ]);

            if (!pathIntersectsBlocks(coordinates, blocks)) {
              console.log(`🟢 Found multi-hop aggressive alternative`);
              alternatives.push({
                path: coordinates,
                distance: route.distance / 1000,
                duration: Math.round(route.duration / 60),
                steps: route.legs[0]?.steps || [],
                blocked: false,
                type: "aggressive_multi_hop",
              });
            }
          }
        } catch (error) {
          console.log("Multi-hop aggressive route failed:", error);
        }
      }
    }

    return alternatives.sort((a, b) => a.distance - b.distance);
  };

  // Calculate distance between two points (in km)
  const calculateDistance = (point1, point2) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((point2.lat - point1.lat) * Math.PI) / 180;
    const dLon = ((point2.lng - point1.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((point1.lat * Math.PI) / 180) *
        Math.cos((point2.lat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Dynamic recalculation when blocks are added/removed (no route caching)
  const dynamicRecalculate = async (currentBlocks = roadBlocks) => {
    if (agents.length === 0) return;

    console.log(
      `🔄 Dynamic recalculation triggered with ${currentBlocks.length} blocks`
    );
    console.log(
      `🚧 Active blocks:`,
      currentBlocks.map((b) => `(${b.lat.toFixed(4)}, ${b.lng.toFixed(4)})`)
    );

    setIsRunning(true);

    try {
      const routePromises = agents.map(async (agent) => {
        if (!agent.start || !agent.end) return null;

        console.log(
          `🎯 Calculating fresh route for agent ${
            agent.id
          } from (${agent.start.lat.toFixed(4)}, ${agent.start.lng.toFixed(
            4
          )}) to (${agent.end.lat.toFixed(4)}, ${agent.end.lng.toFixed(4)})`
        );

        // Get completely fresh route considering ALL current blocks
        const route = await getRoadRoute(
          agent.start,
          agent.end,
          true,
          currentBlocks
        );

        const routeColor = route.blocked ? "#ef4444" : agent.color;
        console.log(
          `${route.blocked ? "🔴" : "🟢"} Agent ${agent.id} route: ${
            route.blocked ? "BLOCKED" : "CLEAR"
          } - ${route.distance.toFixed(2)}km`
        );

        return {
          id: agent.id,
          path: route.path,
          color: routeColor,
          distance: route.distance,
          duration: route.duration,
          steps: route.steps,
          blocked: route.blocked,
        };
      });

      const results = await Promise.all(routePromises);
      const validResults = results.filter((result) => result !== null);

      const blockedCount = validResults.filter((r) => r.blocked).length;
      const clearCount = validResults.length - blockedCount;

      console.log(
        `✅ Recalculation complete: ${validResults.length} routes (${clearCount} clear, ${blockedCount} blocked)`
      );
      setPaths(validResults);
    } catch (error) {
      console.error("❌ Dynamic recalculation error:", error);
    } finally {
      setIsRunning(false);
    }
  };

  // Real road-based pathfinding simulation
  const runSimulation = async () => {
    // Use the dynamic recalculation system
    await dynamicRecalculate();
  };

  const toggleAgentPlacementMode = () => {
    setAgentPlacementMode(!agentPlacementMode);
    setPendingAgent(null);
  };

  const clearAll = () => {
    setAgents([]);
    setPaths([]);
    setPendingAgent(null);
    setCurrentAgentNumber(1);
  };

  const removeRoadBlock = (blockId) => {
    // Clear existing paths immediately to prevent caching issues
    setPaths([]);

    setRoadBlocks((prev) => {
      const updatedBlocks = prev.filter((block) => block.id !== blockId);
      // Trigger dynamic recalculation immediately with cleared cache
      if (agents.length > 0) {
        setTimeout(() => dynamicRecalculate(updatedBlocks), 200);
      }
      return updatedBlocks;
    });
  };

  const handleAgentClick = async (agent) => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    setSelectedAgentAnalysis(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/gemini/analyze-location`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ lat: agent.start.lat, lng: agent.start.lng }),
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Analysis request failed");
      }

      const result = await response.json();
      setSelectedAgentAnalysis({
        agentId: agent.id,
        data: result.data,
      });
    } catch (error) {
      setAnalysisError(error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-center mb-2">
            🗺️ Real-World Pathfinding
          </h1>
          <p className="text-gray-400 text-center">
            Click on the map to place agents and calculate road-based routes
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-4">
            {/* Agent Controls */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <span className="mr-2">🎯</span>Agent Controls
              </h3>

              <div className="space-y-4">
                <button
                  onClick={toggleAgentPlacementMode}
                  className={`w-full px-4 py-3 rounded-lg font-medium transition-all transform hover:scale-105 ${
                    agentPlacementMode
                      ? "bg-green-600 text-white hover:bg-green-700 shadow-lg"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  {agentPlacementMode ? "✓ Add Agent Active" : "+ Add Agent"}
                </button>

                <div className="bg-gray-700 rounded-lg p-3">
                  <div className="text-sm text-gray-300 mb-2">
                    Agents:{" "}
                    <span className="text-white font-bold">
                      {agents.length}
                    </span>
                  </div>
                  {agentPlacementMode && (
                    <div className="text-xs px-2 py-1 bg-blue-600 rounded text-center">
                      {pendingAgent
                        ? "Click for END point"
                        : "Click for START point"}
                    </div>
                  )}
                </div>

                <button
                  onClick={runSimulation}
                  disabled={isRunning || agents.length === 0}
                  className={`w-full px-4 py-3 rounded-lg font-medium transition-all transform hover:scale-105 ${
                    isRunning || agents.length === 0
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
                  }`}
                >
                  {isRunning ? "⏳ Calculating Routes..." : "▶️ Run Simulation"}
                </button>

                {agents.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="w-full px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all transform hover:scale-105"
                  >
                    🗑️ Clear All Agents
                  </button>
                )}
              </div>
            </div>

            {/* Road Blocking Controls */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <span className="mr-2">🚧</span>Emergency Blocks
              </h3>

              <div className="space-y-4">
                <button
                  onClick={() => {
                    setBlockingMode(!blockingMode);
                    setAgentPlacementMode(false);
                    setPendingAgent(null);
                  }}
                  className={`w-full px-4 py-3 rounded-lg font-medium transition-all transform hover:scale-105 ${
                    blockingMode
                      ? "bg-red-600 text-white hover:bg-red-700 shadow-lg"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  {blockingMode ? "🚧 Block Road Active" : "🚧 Block Road"}
                </button>

                <div className="bg-gray-700 rounded-lg p-3">
                  <div className="text-sm text-gray-300 mb-2">
                    Blocks:{" "}
                    <span className="text-white font-bold">
                      {roadBlocks.length}
                    </span>
                  </div>
                  {blockingMode && (
                    <div className="text-xs px-2 py-1 bg-red-600 rounded text-center">
                      Click map to block roads
                    </div>
                  )}
                </div>

                {roadBlocks.length > 0 && (
                  <button
                    onClick={() => {
                      setRoadBlocks([]);
                      if (agents.length > 0) {
                        setTimeout(() => dynamicRecalculate([]), 100);
                      }
                    }}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all transform hover:scale-105"
                  >
                    🗑️ Clear All Blocks
                  </button>
                )}
              </div>
            </div>

            {/* AI Analysis Controls */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <span className="mr-2">🤖</span>AI Analysis
              </h3>
              <button
                onClick={() => {
                  setAnalysisMode(!analysisMode);
                  setAgentPlacementMode(false);
                  setBlockingMode(false);
                }}
                className={`w-full px-4 py-3 rounded-lg font-medium transition-all transform hover:scale-105 ${
                  analysisMode
                    ? "bg-purple-600 text-white hover:bg-purple-700 shadow-lg"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {analysisMode ? "✓ Analysis Mode Active" : "Analyze Location"}
              </button>
              {analysisMode && (
                <div className="text-xs mt-3 px-2 py-1 bg-purple-600 rounded text-center">
                  Click on the map to analyze an area
                </div>
              )}
            </div>

            {(analysisPoint || (isAnalyzing && !selectedAgentAnalysis)) && (
              <LocationAnalysisPanel
                analysis={analysisData}
                isLoading={isAnalyzing}
                error={analysisError}
                onClear={clearAnalysis}
              />
            )}

            {selectedAgentAnalysis && (
              <LocationAnalysisPanel
                analysis={selectedAgentAnalysis.data}
                isLoading={isAnalyzing}
                error={analysisError}
                onClear={() => setSelectedAgentAnalysis(null)}
              />
            )}

            {/* Results Panel */}
            {paths.length > 0 && (
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <span className="mr-2">🛣️</span>Route Results
                </h3>
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {paths.map((path) => (
                    <div key={path.id} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <div
                          className="w-4 h-4 rounded-full mr-3 border-2 border-white shadow-sm"
                          style={{ backgroundColor: path.color }}
                        ></div>
                        <span className="font-medium">Agent {path.id}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
                        <div className="flex justify-between">
                          <span>📏 Distance:</span>
                          <span className="text-white font-medium">
                            {path.distance.toFixed(2)} km
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>⏱️ Walk Time:</span>
                          <span className="text-white font-medium">
                            {path.duration} min
                          </span>
                        </div>
                        <div className="flex justify-between col-span-2">
                          <span>📍 Waypoints:</span>
                          <span className="text-white font-medium">
                            {path.path?.length || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-600 text-xs text-gray-400 text-center">
                  Routes via OSRM real road networks
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-3">
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-2xl">
              {/* Location Search */}
              <MapLocationSearch
                map={mapInstance}
                onLocationFound={(location) => {
                  console.log("Location found:", location);
                  if (location.type === "current_location") {
                    setCurrentLocationMarker(location);
                  } else {
                    setCurrentLocationMarker(null);
                  }
                }}
              />

              <div
                className="rounded-lg overflow-hidden"
                style={{ height: "65vh" }}
              >
                <MapContainer
                  center={[40.7128, -74.006]} // New York City
                  zoom={13}
                  style={{ height: "100%", width: "100%" }}
                  ref={setMapInstance}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <MapClickHandler />
                  <MapRefHandler />

                  {/* Render agent markers */}
                  {agents.map((agent) => (
                    <React.Fragment key={agent.id}>
                      {agent.start && (
                        <Marker
                          position={[agent.start.lat, agent.start.lng]}
                          icon={createMarkerIcon(
                            agent.color,
                            agent.id,
                            "start"
                          )}
                          eventHandlers={{
                            click: () => handleAgentClick(agent),
                          }}
                        >
                          <Popup>
                            <div className="text-center">
                              <div className="font-bold">
                                Agent {agent.id} - Start
                              </div>
                              <div className="text-sm text-gray-600">
                                {agent.start.lat.toFixed(4)},{" "}
                                {agent.start.lng.toFixed(4)}
                              </div>
                            </div>
                          </Popup>
                        </Marker>
                      )}
                      {agent.end && (
                        <Marker
                          position={[agent.end.lat, agent.end.lng]}
                          icon={createMarkerIcon(agent.color, agent.id, "end")}
                        >
                          <Popup>
                            <div className="text-center">
                              <div className="font-bold">
                                Agent {agent.id} - End
                              </div>
                              <div className="text-sm text-gray-600">
                                {agent.end.lat.toFixed(4)},{" "}
                                {agent.end.lng.toFixed(4)}
                              </div>
                            </div>
                          </Popup>
                        </Marker>
                      )}
                    </React.Fragment>
                  ))}

                  {/* Render pending agent start marker */}
                  {pendingAgent && pendingAgent.start && (
                    <Marker
                      position={[
                        pendingAgent.start.lat,
                        pendingAgent.start.lng,
                      ]}
                      icon={createMarkerIcon(
                        pendingAgent.color,
                        pendingAgent.id,
                        "start"
                      )}
                    >
                      <Popup>
                        <div className="text-center">
                          <div className="font-bold">
                            Agent {pendingAgent.id} - Start
                          </div>
                          <div className="text-sm text-orange-600">
                            Click map to set end point
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  )}

                  {/* Render analysis point marker */}
                  {analysisPoint && (
                    <Marker
                      position={[analysisPoint.lat, analysisPoint.lng]}
                      icon={L.divIcon({
                        html: `<div class="w-8 h-8 bg-purple-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white text-lg animate-pulse">🤖</div>`,
                        className: "analysis-marker",
                        iconSize: [32, 32],
                        iconAnchor: [16, 16],
                      })}
                    >
                      <Popup>
                        <div className="text-center font-bold">
                          Analysis Point
                        </div>
                      </Popup>
                    </Marker>
                  )}

                  {/* Render road-based paths */}
                  {paths.map((pathData) => (
                    <Polyline
                      key={pathData.id}
                      positions={pathData.path}
                      color={pathData.color}
                      weight={4}
                      opacity={0.8}
                      lineCap="round"
                      lineJoin="round"
                    />
                  ))}

                  {/* Current Location Marker */}
                  {currentLocationMarker && (
                    <Marker
                      position={[
                        currentLocationMarker.lat,
                        currentLocationMarker.lng,
                      ]}
                      icon={L.divIcon({
                        html: `
                          <div style="
                            position: relative;
                            width: 24px;
                            height: 24px;
                          ">
                            <!-- Pulsing ring -->
                            <div style="
                              position: absolute;
                              top: 50%;
                              left: 50%;
                              transform: translate(-50%, -50%);
                              width: 40px;
                              height: 40px;
                              border-radius: 50%;
                              background-color: rgba(16, 185, 129, 0.3);
                              animation: pulse 2s infinite;
                            "></div>
                            <!-- Main marker -->
                            <div style="
                              position: absolute;
                              top: 50%;
                              left: 50%;
                              transform: translate(-50%, -50%);
                              width: 16px;
                              height: 16px;
                              border-radius: 50%;
                              background-color: #10b981;
                              border: 3px solid white;
                              box-shadow: 0 2px 8px rgba(0,0,0,0.4);
                            "></div>
                          </div>
                          <style>
                            @keyframes pulse {
                              0% { transform: translate(-50%, -50%) scale(0.8); opacity: 1; }
                              100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
                            }
                          </style>
                        `,
                        className: "current-location-marker",
                        iconSize: [24, 24],
                        iconAnchor: [12, 12],
                      })}
                    >
                      <Popup>
                        <div className="text-center">
                          <div className="font-bold text-green-600">
                            📍 Your Location
                          </div>
                          <div className="text-sm text-gray-600">
                            Current GPS Position
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  )}

                  {/* Road Block Markers */}
                  {roadBlocks.map((block) => (
                    <Marker
                      key={block.id}
                      position={[block.lat, block.lng]}
                      icon={L.divIcon({
                        html: `
                          <div style="
                            position: relative;
                            width: 30px;
                            height: 30px;
                          ">
                            <!-- Block area circle -->
                            <div style="
                              position: absolute;
                              top: 50%;
                              left: 50%;
                              transform: translate(-50%, -50%);
                              width: 30px;
                              height: 30px;
                              border-radius: 50%;
                              background-color: rgba(239, 68, 68, 0.3);
                              border: 2px solid #ef4444;
                            "></div>
                            <!-- Warning icon -->
                            <div style="
                              position: absolute;
                              top: 50%;
                              left: 50%;
                              transform: translate(-50%, -50%);
                              width: 20px;
                              height: 20px;
                              border-radius: 50%;
                              background-color: #ef4444;
                              border: 2px solid white;
                              display: flex;
                              align-items: center;
                              justify-content: center;
                              font-size: 12px;
                              color: white;
                              font-weight: bold;
                            ">⚠</div>
                          </div>
                        `,
                        className: "road-block-marker",
                        iconSize: [30, 30],
                        iconAnchor: [15, 15],
                      })}
                    >
                      <Popup>
                        <div className="text-center">
                          <div className="font-bold text-red-600">
                            🚧 Road Block
                          </div>
                          <div className="text-sm text-gray-600">
                            Emergency Obstruction
                          </div>
                          <button
                            onClick={() => removeRoadBlock(block.id)}
                            className="mt-2 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                          >
                            Remove Block
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreeMapPathfinding;
