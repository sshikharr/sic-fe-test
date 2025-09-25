import React from "react";

export const MapGrid = ({
  mapData,
  agents,
  simulation,
  onCellClick,
  selectedAgentIndex,
  isSettingStart,
  isSettingEnd,
  isBlockingMode,
  loading,
  agentPlacementMode,
  pendingAgent,
}) => {
  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="bg-gray-700 h-64 rounded"></div>
        </div>
      </div>
    );
  }

  if (!mapData) return null;

  const getCellContent = (x, y) => {
    // Check pending agent first
    if (pendingAgent?.start?.x === x && pendingAgent?.start?.y === y) {
      return { type: "start", agents: [pendingAgent], isPending: true };
    }

    // Find all agents at this position
    const startAgents = agents.filter(
      (agent) => agent.start?.x === x && agent.start?.y === y
    );
    const endAgents = agents.filter(
      (agent) => agent.end?.x === x && agent.end?.y === y
    );

    if (startAgents.length > 0) {
      return { type: "start", agents: startAgents };
    }
    if (endAgents.length > 0) {
      return { type: "end", agents: endAgents };
    }
    return null;
  };

  const getCellClasses = (x, y) => {
    const baseClasses =
      "w-6 h-6 border border-gray-400 flex items-center justify-center text-xs font-bold cursor-pointer transition-all duration-200";

    // Walls - Dark color for blocked areas
    if (mapData[y][x] === 1) {
      return `${baseClasses} bg-gray-700 hover:bg-gray-600 border-gray-600`;
    }

    const content = getCellContent(x, y);
    
    // Start points - Light background
    if (content?.type === "start") {
      const borderClass = content.isPending ? "border-yellow-400 animate-pulse" : "border-green-400";
      return `${baseClasses} bg-gray-200 hover:brightness-110 shadow-lg ${borderClass}`;
    }
    
    // End points - Light background
    if (content?.type === "end") {
      return `${baseClasses} bg-gray-200 hover:brightness-110 shadow-lg border-red-400`;
    }

    // Blocking mode - Light background with red hover
    if (isBlockingMode) {
      return `${baseClasses} bg-gray-200 hover:bg-red-300 border-red-400 hover:border-red-300`;
    }

    // Default walkable cells - Light color for walking paths
    return `${baseClasses} bg-gray-200 hover:bg-gray-300 border-gray-400`;
  };

  const getCellStyle = () => {
    // No cell styling at all - only SVG lines for paths
    return {};
  };

  const getUnreachableAgents = () => {
    if (!simulation?.results) return [];
    
    return agents.filter(agent => {
      const result = simulation.results.find(r => r.agentId === agent.id);
      return result && (!result.path || result.path.length === 0);
    });
  };



  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
      {/* Status Bar */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-white">Interactive Map</h2>
          <div className="text-sm text-gray-400">
            Size: {mapData[0].length} × {mapData.length}
          </div>
        </div>
        
        <div className="flex gap-4 text-sm">
          {agentPlacementMode && !pendingAgent && (
            <span className="bg-green-600 px-3 py-1 rounded-full animate-pulse shadow-lg">
              🎯 Click to add Agent START point
            </span>
          )}
          {agentPlacementMode && pendingAgent && (
            <span className="bg-red-600 px-3 py-1 rounded-full animate-pulse shadow-lg">
              🏁 Click to add Agent END point
            </span>
          )}
          {isSettingStart && (
            <span className="bg-green-600 px-3 py-1 rounded-full shadow-lg">
              🎯 Click to set START
            </span>
          )}
          {isSettingEnd && (
            <span className="bg-red-600 px-3 py-1 rounded-full shadow-lg">
              🏁 Click to set END
            </span>
          )}
          {isBlockingMode && (
            <span className="bg-yellow-600 px-3 py-1 rounded-full shadow-lg">
              🧱 BLOCKING MODE - Click to toggle walls
            </span>
          )}
        </div>
      </div>

      {/* Map Container */}
      <div className="flex justify-center">
        <div className="inline-block relative bg-gray-300 p-6 rounded-xl shadow-inner border border-gray-500">
          <div className="relative">
            <div
              className="grid gap-0 border-2 border-gray-500 rounded"
              style={{ gridTemplateColumns: `repeat(${mapData[0].length}, 1fr)` }}
            >
              {mapData.map((row, y) =>
                row.map((cell, x) => {
                  const content = getCellContent(x, y);
                  return (
                    <div
                      key={`${x}-${y}`}
                      className={getCellClasses(x, y)}
                      style={getCellStyle()}
                      onClick={() => onCellClick(x, y)}
                      title={`(${x},${y}) ${cell === 1 ? "Wall" : "Path"}${isBlockingMode ? " - Click to toggle wall" : ""}`}
                    >
                    {/* Walls */}
                    {cell === 1 && "█"}
                    
                    {/* Start Points - Agent Color Circles - NO NUMBERS ON PATH */}
                    {content?.type === "start" && (
                      <div className="relative w-full h-full flex items-center justify-center">
                        <div 
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-white font-bold text-xs border-2 border-white shadow-lg ${
                            content.isPending ? "animate-pulse" : ""
                          }`}
                          style={{
                            backgroundColor: content.isPending ? '#fbbf24' : content.agents[0].color
                          }}
                        >
                          {content.agents[0].id}
                        </div>
                      </div>
                    )}
                    
                    {/* End Points - Agent Color Circles - NO NUMBERS ON PATH */}
                    {content?.type === "end" && (
                      <div className="relative w-full h-full flex items-center justify-center">
                        <div 
                          className="w-5 h-5 rounded-full flex items-center justify-center text-white font-bold text-xs border-2 border-white shadow-lg"
                          style={{
                            backgroundColor: content.agents[0].color,
                            filter: 'brightness(0.8)'
                          }}
                        >
                          {content.agents[0].id}
                        </div>
                      </div>
                    )}
                    
                    {/* NOTHING ELSE - NO PATH VISUALIZATION ON CELLS */}
                  </div>
                );
              })
            )}
            </div>

            {/* SVG Overlay for All Agent Path Lines */}
            {simulation?.results && (
              <svg
                className="absolute inset-0 pointer-events-none"
                style={{ width: '100%', height: '100%' }}
              >
                {/* Successful paths */}
                {simulation.results.map((result, index) => {
                  if (!result.path || result.path.length < 2) return null;
                  
                  const agent = agents.find(a => a.id === result.agentId);
                  if (!agent) return null;
                  
                  const cellWidth = 100 / mapData[0].length;
                  const cellHeight = 100 / mapData.length;
                  
                  // Create path segments
                  return (
                    <g key={`path-${agent.id}-${index}`}>
                      {result.path.map((point, pointIndex) => {
                        if (pointIndex === result.path.length - 1) return null;
                        
                        const nextPoint = result.path[pointIndex + 1];
                        const x1 = (point.x + 0.5) * cellWidth;
                        const y1 = (point.y + 0.5) * cellHeight;
                        const x2 = (nextPoint.x + 0.5) * cellWidth;
                        const y2 = (nextPoint.y + 0.5) * cellHeight;
                        
                        return (
                          <line
                            key={`segment-${pointIndex}`}
                            x1={`${x1}%`}
                            y1={`${y1}%`}
                            x2={`${x2}%`}
                            y2={`${y2}%`}
                            stroke={agent.color}
                            strokeWidth="2"
                            opacity="0.9"
                            strokeLinecap="round"
                          />
                        );
                      })}
                    </g>
                  );
                })}
                
                {/* Blocked paths */}
                {getUnreachableAgents().map((agent, index) => {
                  if (!agent.start || !agent.end) return null;
                  
                  const cellWidth = 100 / mapData[0].length;
                  const cellHeight = 100 / mapData.length;
                  
                  const startX = (agent.start.x + 0.5) * cellWidth;
                  const startY = (agent.start.y + 0.5) * cellHeight;
                  const endX = (agent.end.x + 0.5) * cellWidth;
                  const endY = (agent.end.y + 0.5) * cellHeight;
                  
                  return (
                    <line
                      key={`unreachable-${agent.id}-${index}`}
                      x1={`${startX}%`}
                      y1={`${startY}%`}
                      x2={`${endX}%`}
                      y2={`${endY}%`}
                      stroke="#ef4444"
                      strokeWidth="1"
                      opacity="0.8"
                      strokeLinecap="round"
                      strokeDasharray="4,2"
                    />
                  );
                })}
              </svg>
            )}
          </div>

        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex justify-center">
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="grid grid-cols-2 md:grid-cols-7 gap-6 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-gray-700 border border-gray-500 rounded flex items-center justify-center text-xs">█</span>
              <span>Wall</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-lg">1</span>
              <span>Start Point</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-lg">1</span>
              <span>End Point</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 rounded-full shadow-lg" style={{backgroundColor: '#ff8c00', boxShadow: '0 0 4px rgba(255, 140, 0, 0.6)'}}></div>
              <span>Agent Path</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-red-500 rounded"></div>
              <span>Blocked Path</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-blue-500 rounded opacity-50 flex items-center justify-center text-white text-xs">2</span>
              <span>Congestion</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-lg relative">
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full flex items-center justify-center text-xs">3</span>
                1
              </div>
              <span>Multiple Agents</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
