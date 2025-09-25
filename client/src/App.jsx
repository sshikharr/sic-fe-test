import React, { useState } from "react";
import HomePage from "./components/HomePage";
import { MapGrid } from "./components/MapGrid";
import FreeMapPathfindingNew from "./components/FreeMapPathfindingNew";
import { ResultsPanel } from "./components/ResultsPanel";
import { MapSelector } from "./components/MapSelector";
import { validateAgentsForSimulation } from "./components/AgentManager";
import { getAgentColor } from "./utils/colors";
import { useSimulation } from "./hooks/useSimulation";
import { useMapData } from "./hooks/useMapData";

function App() {
  const [currentPage, setCurrentPage] = useState("home"); // 'home', 'app'
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'mapbox'
  const [selectedMap, setSelectedMap] = useState("Office");
  const [sessionId] = useState(
    () => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );
  const [agents, setAgents] = useState([]);
  const [selectedAgentIndex, setSelectedAgentIndex] = useState(null);
  const [isSettingStart, setIsSettingStart] = useState(false);
  const [isSettingEnd, setIsSettingEnd] = useState(false);
  const [isBlockingMode, setIsBlockingMode] = useState(false);
  const [agentPlacementMode, setAgentPlacementMode] = useState(false);
  const [pendingAgent, setPendingAgent] = useState(null);
  const [clickCount, setClickCount] = useState(0);
  const [currentAgentNumber, setCurrentAgentNumber] = useState(1);

  const {
    mapData,
    loading: mapLoading,
    error: mapError,
    updateMapBlock,
  } = useMapData(selectedMap, sessionId);

  const {
    simulation,
    isRunning,
    error: simulationError,
    runSimulation,
    clearResults,
  } = useSimulation();

  const handleCellClick = async (x, y) => {
    if (isBlockingMode) {
      try {
        await updateMapBlock(x, y);

        // If we have an active simulation, recalculate paths immediately
        if (simulation && agents.length > 0) {
          const validAgents = agents.filter(
            (agent) => agent.start && agent.end
          );
          if (validAgents.length > 0) {
            // Small delay to allow map update to propagate
            setTimeout(async () => {
              await runSimulation(selectedMap, validAgents, sessionId);
            }, 100);
          }
        }
      } catch (error) {
        // Error handled in useMapData hook
      }
      return;
    }

    // Check if clicking on existing agent points to add multiple agents
    const existingStartAgents = agents.filter(
      (agent) => agent.start?.x === x && agent.start?.y === y
    );
    const existingEndAgents = agents.filter(
      (agent) => agent.end?.x === x && agent.end?.y === y
    );

    if (
      (existingStartAgents.length > 0 || existingEndAgents.length > 0) &&
      !agentPlacementMode
    ) {
      const count = prompt(
        `Add how many agents at position (${x}, ${y})?`,
        "1"
      );
      if (count && !isNaN(count) && parseInt(count) > 0) {
        const numAgents = parseInt(count);
        const newAgents = [];

        for (let i = 0; i < numAgents; i++) {
          const newAgent = {
            id: agents.length + i + 1,
            start: existingStartAgents.length > 0 ? { x, y } : null,
            end: existingEndAgents.length > 0 ? { x, y } : null,
            color: getAgentColor(agents.length + i + 1),
          };
          newAgents.push(newAgent);
        }

        setAgents([...agents, ...newAgents]);
      }
      return;
    }

    // Sequential agent placement mode
    if (agentPlacementMode) {
      const isEvenClick = clickCount % 2 === 0;

      if (isEvenClick) {
        // Start point
        const newAgent = {
          id: currentAgentNumber,
          start: { x, y },
          end: null,
          color: getAgentColor(currentAgentNumber),
        };
        setPendingAgent(newAgent);
        setClickCount(clickCount + 1);
      } else {
        // End point
        if (pendingAgent) {
          const completedAgent = { ...pendingAgent, end: { x, y } };
          setAgents([...agents, completedAgent]);
          setPendingAgent(null);
          setClickCount(clickCount + 1);
          setCurrentAgentNumber(currentAgentNumber + 1);
        }
      }
      return;
    }

    if (selectedAgentIndex === null) return;

    const updatedAgents = [...agents];
    if (isSettingStart) {
      updatedAgents[selectedAgentIndex].start = { x, y };
      setIsSettingStart(false);
    } else if (isSettingEnd) {
      updatedAgents[selectedAgentIndex].end = { x, y };
      setIsSettingEnd(false);
    }
    setAgents(updatedAgents);
  };

  const handleRunSimulation = async () => {
    const validation = validateAgentsForSimulation(agents);
    if (!validation.valid) {
      alert(validation.message);
      return;
    }

    await runSimulation(selectedMap, validation.validAgents, sessionId);
  };

  const toggleAgentPlacementMode = () => {
    setAgentPlacementMode(!agentPlacementMode);
    setPendingAgent(null);
    setIsSettingStart(false);
    setIsSettingEnd(false);
    setSelectedAgentIndex(null);
    setClickCount(0);
    setCurrentAgentNumber(1);
  };

  const clearAllAgents = () => {
    setAgents([]);
    setSelectedAgentIndex(null);
    setPendingAgent(null);
    setIsSettingStart(false);
    setIsSettingEnd(false);
    setClickCount(0);
    setCurrentAgentNumber(1);
  };

  if (mapError || simulationError) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-red-900 text-red-100 p-6 rounded-lg max-w-md">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{mapError || simulationError}</p>
        </div>
      </div>
    );
  }

  // Show homepage first
  if (currentPage === "home") {
    return <HomePage onNavigateToApp={() => setCurrentPage("app")} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Back to Home Button */}
      <button
        onClick={() => setCurrentPage("home")}
        className="fixed top-4 left-4 z-50 px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg font-medium hover:bg-gray-700 transition-all flex items-center space-x-2"
      >
        <span>←</span>
        <span>Home</span>
      </button>

      {viewMode === "grid" && (
        <header className="bg-gray-800 border-b border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Pathfinding Simulation</h1>

            {/* View Mode Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  viewMode === "grid"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                }`}
              >
                🔲 Grid Mode
              </button>
              <button
                onClick={() => setViewMode("mapbox")}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  viewMode === "mapbox"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                }`}
              >
                🗺️ Map Mode
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Floating Mode Toggle for Map Mode */}
      {viewMode === "mapbox" && (
        <div className="fixed top-6 right-6 z-50">
          <div className="bg-gray-800 border border-gray-600 rounded-xl shadow-2xl p-2 flex gap-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 ${
                viewMode === "grid"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              🔲 Grid Mode
            </button>
            <button
              onClick={() => setViewMode("mapbox")}
              className={`px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 ${
                viewMode === "mapbox"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              🗺️ Map Mode
            </button>
          </div>
        </div>
      )}

      {/* Render based on view mode */}
      {viewMode === "mapbox" ? (
        <FreeMapPathfindingNew />
      ) : (
        <div className="container mx-auto p-4 max-w-7xl">
          <div className="space-y-4">
            {/* Top Controls Bar */}
            <div className="flex flex-wrap gap-4 items-center justify-between bg-gray-800 rounded-lg p-4">
              <div className="flex gap-4 items-center">
                <MapSelector
                  selectedMap={selectedMap}
                  onMapChange={setSelectedMap}
                />

                <button
                  onClick={toggleAgentPlacementMode}
                  className={`px-4 py-2 rounded font-medium transition-all ${
                    agentPlacementMode
                      ? "bg-green-600 hover:bg-green-700 shadow-lg"
                      : "bg-purple-600 hover:bg-purple-700"
                  }`}
                >
                  {agentPlacementMode ? "✓ Quick Add Mode" : "Enable Quick Add"}
                </button>

                <button
                  onClick={() => setIsBlockingMode(!isBlockingMode)}
                  className={`px-4 py-2 rounded font-medium transition-all ${
                    isBlockingMode
                      ? "bg-yellow-600 hover:bg-yellow-700 shadow-lg"
                      : "bg-gray-600 hover:bg-gray-700"
                  }`}
                >
                  {isBlockingMode ? "✓ Block Mode" : "Block Mode"}
                </button>
              </div>

              <div className="flex gap-4 items-center">
                <div className="text-sm text-gray-300">
                  Agents:{" "}
                  <span className="font-bold text-white">{agents.length}</span>
                  {agentPlacementMode && (
                    <span className="ml-4 px-2 py-1 bg-blue-600 rounded text-white text-xs">
                      Next: Agent {currentAgentNumber}{" "}
                      {clickCount % 2 === 0 ? "START" : "END"}
                    </span>
                  )}
                </div>

                {agents.length > 0 && (
                  <button
                    onClick={clearAllAgents}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm font-medium transition-colors"
                  >
                    Clear All
                  </button>
                )}

                <button
                  onClick={handleRunSimulation}
                  disabled={isRunning || agents.length === 0}
                  className={`px-6 py-2 rounded font-medium transition-all ${
                    isRunning || agents.length === 0
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 shadow-lg"
                  }`}
                >
                  {isRunning ? "Running..." : "Run Simulation"}
                </button>

                {simulation && (
                  <button
                    onClick={clearResults}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded font-medium transition-colors"
                  >
                    Clear Results
                  </button>
                )}
              </div>
            </div>

            {/* Main Map Area */}
            {mapData && (
              <MapGrid
                mapData={mapData}
                agents={agents}
                simulation={simulation}
                onCellClick={handleCellClick}
                selectedAgentIndex={selectedAgentIndex}
                isSettingStart={isSettingStart}
                isSettingEnd={isSettingEnd}
                isBlockingMode={isBlockingMode}
                loading={mapLoading}
                agentPlacementMode={agentPlacementMode}
                pendingAgent={pendingAgent}
              />
            )}

            {/* Results Section */}
            {simulation && (
              <ResultsPanel simulation={simulation} agents={agents} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
