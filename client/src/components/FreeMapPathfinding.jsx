import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { getAgentColor } from '../utils/colors';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const FreeMapPathfinding = () => {
  const [agents, setAgents] = useState([]);
  const [agentPlacementMode, setAgentPlacementMode] = useState(false);
  const [pendingAgent, setPendingAgent] = useState(null);
  const [currentAgentNumber, setCurrentAgentNumber] = useState(1);
  const [paths, setPaths] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

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
        ${number}${type === 'start' ? 'S' : 'E'}
      </div>
    `;

    return L.divIcon({
      html: markerHtml,
      className: 'agent-marker',
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
  };

  // Component to handle map clicks
  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        if (!agentPlacementMode) return;

        const { lat, lng } = e.latlng;
        
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
            end: { lat, lng }
          };
          setAgents(prev => [...prev, completedAgent]);
          setPendingAgent(null);
          setCurrentAgentNumber(prev => prev + 1);
        }
      },
    });
    return null;
  };

  // Get real road-based routes using free OpenRouteService API
  const getRoadRoute = async (start, end) => {
    try {
      // Using free OSRM (Open Source Routing Machine) - no API key required
      const url = `https://router.project-osrm.org/route/v1/walking/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]); // Swap lng,lat to lat,lng for Leaflet
        
        return {
          path: coordinates,
          distance: route.distance / 1000, // Convert to km
          duration: Math.round(route.duration / 60), // Convert to minutes
          steps: route.legs[0]?.steps || []
        };
      }
      
      // Fallback to straight line if routing fails
      return {
        path: [[start.lat, start.lng], [end.lat, end.lng]],
        distance: calculateDistance(start, end),
        duration: Math.round(calculateDistance(start, end) * 12),
        steps: []
      };
    } catch (error) {
      console.error('Routing error:', error);
      // Fallback to straight line
      return {
        path: [[start.lat, start.lng], [end.lat, end.lng]],
        distance: calculateDistance(start, end),
        duration: Math.round(calculateDistance(start, end) * 12),
        steps: []
      };
    }
  };

  // Real road-based pathfinding simulation
  const runSimulation = async () => {
    setIsRunning(true);
    
    try {
      // Get road routes for each agent
      const routePromises = agents.map(async (agent) => {
        if (!agent.start || !agent.end) return null;
        
        const route = await getRoadRoute(agent.start, agent.end);
        
        return {
          id: agent.id,
          path: route.path,
          color: agent.color,
          distance: route.distance,
          duration: route.duration,
          steps: route.steps
        };
      });
      
      const newPaths = (await Promise.all(routePromises)).filter(Boolean);
      setPaths(newPaths);
    } catch (error) {
      console.error('Simulation error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  // Calculate distance between two points (in km)
  const calculateDistance = (point1, point2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLon = (point2.lng - point1.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
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

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-center mb-2">🗺️ Real-World Pathfinding</h1>
          <p className="text-gray-400 text-center">Click on the map to place agents and calculate road-based routes</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Controls Panel - Left Side */}
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
                      ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {agentPlacementMode ? '✓ Add Agent Active' : '+ Add Agent'}
                </button>
                
                <div className="bg-gray-700 rounded-lg p-3">
                  <div className="text-sm text-gray-300 mb-2">Agents: <span className="text-white font-bold">{agents.length}</span></div>
                  {agentPlacementMode && (
                    <div className="text-xs px-2 py-1 bg-blue-600 rounded text-center">
                      {pendingAgent ? 'Click for END point' : 'Click for START point'}
                    </div>
                  )}
                </div>
                
                <button
                  onClick={runSimulation}
                  disabled={isRunning || agents.length === 0}
                  className={`w-full px-4 py-3 rounded-lg font-medium transition-all transform hover:scale-105 ${
                    isRunning || agents.length === 0
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
                  }`}
                >
                  {isRunning ? '⏳ Calculating Routes...' : '▶️ Run Simulation'}
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

            {/* Legend */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h4 className="text-lg font-semibold mb-4 flex items-center">
                <span className="mr-2">📍</span>Legend
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-center">
                  <div className="w-5 h-5 rounded-full bg-blue-500 mr-3 border-2 border-white"></div>
                  <span>Agent Start (1S, 2S, etc.)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-5 h-5 rounded-full bg-red-500 mr-3 border-2 border-white"></div>
                  <span>Agent End (1E, 2E, etc.)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-5 h-1 bg-green-500 mr-3 rounded"></div>
                  <span>Walking Route</span>
                </div>
              </div>
            </div>

            {/* Results Panel */}
            {paths.length > 0 && (
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <span className="mr-2">🛣️</span>Route Results
                </h3>
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {paths.map(path => (
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
                          <span className="text-white font-medium">{path.distance.toFixed(2)} km</span>
                        </div>
                        <div className="flex justify-between">
                          <span>⏱️ Walk Time:</span>
                          <span className="text-white font-medium">{path.duration} min</span>
                        </div>
                        <div className="flex justify-between col-span-2">
                          <span>📍 Waypoints:</span>
                          <span className="text-white font-medium">{path.path?.length || 0}</span>
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

          {/* Map Container - Right Side */}
          {/* ... other code */}
      {/* Map Container - Right Side */}
      <div className="lg:col-span-3">
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-2xl">
          <div className="rounded-lg overflow-hidden" style={{ height: '70vh' }}>
            <MapContainer
              center={[40.7128, -74.0060]} // New York City
              zoom={13}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              <MapClickHandler />
              
              {/* Render agent markers */}
              {agents.map(agent => (
                <React.Fragment key={agent.id}>
                  {/* ... Marker logic (unchanged) ... */}
                </React.Fragment>
              ))}
              
              {/* Render pending agent start marker */}
              {pendingAgent && pendingAgent.start && (
                <Marker
                  position={[pendingAgent.start.lat, pendingAgent.start.lng]}
                  icon={createMarkerIcon(pendingAgent.color, pendingAgent.id, 'start')}
                >
                  {/* ... Popup (unchanged) ... */}
                </Marker>
              )}
              
              {/* Render road-based paths */}
              {paths.map(pathData => (
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