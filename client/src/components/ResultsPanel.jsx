import React from "react";

export const ResultsPanel = ({ simulation, agents }) => {
  if (!simulation) return null;

  const successfulPaths = simulation.results.filter(
    (result) => result.path && result.path.length > 0
  );
  const failedPaths = simulation.results.filter(
    (result) => !result.path || result.path.length === 0
  );
  const averageSteps =
    successfulPaths.length > 0
      ? (
          successfulPaths.reduce((sum, result) => sum + result.steps, 0) /
          successfulPaths.length
        ).toFixed(1)
      : 0;

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">🎯 Simulation Results</h2>
        <div className="flex gap-4 text-sm">
          <div className="bg-green-900/50 px-3 py-1 rounded-full">
            <span className="text-green-400 font-bold">{successfulPaths.length}</span>
            <span className="text-green-300 ml-1">Success</span>
          </div>
          <div className="bg-red-900/50 px-3 py-1 rounded-full">
            <span className="text-red-400 font-bold">{failedPaths.length}</span>
            <span className="text-red-300 ml-1">Failed</span>
          </div>
          <div className="bg-blue-900/50 px-3 py-1 rounded-full">
            <span className="text-blue-400 font-bold">{averageSteps}</span>
            <span className="text-blue-300 ml-1">Avg Steps</span>
          </div>
        </div>
      </div>

      {/* Horizontal Agent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {simulation.results.map((result) => {
          // Find the corresponding agent to get color
          const agent = agents?.find(a => a.id === result.agentId);
          const agentColor = agent?.color || `hsl(${((result.agentId - 1) * 137.5) % 360}, 70%, 50%)`;
          
          return (
            <div
              key={result.agentId}
              className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                result.error || result.steps === 0
                  ? "border-red-500 bg-red-900/20 hover:bg-red-900/30"
                  : "border-green-500 bg-green-900/20 hover:bg-green-900/30"
              }`}
            >
              {/* Agent Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full shadow-lg border-2 border-white"
                    style={{ backgroundColor: agentColor }}
                  />
                  <span className="font-bold text-white">Agent {result.agentId}</span>
                </div>
                <span
                  className={`text-sm font-bold px-2 py-1 rounded-full ${
                    result.steps > 0 
                      ? "bg-green-600 text-white" 
                      : "bg-red-600 text-white"
                  }`}
                >
                  {result.steps > 0 ? `${result.steps} steps` : "Failed"}
                </span>
              </div>

              {/* Start/End Points */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between bg-gray-900/50 p-2 rounded">
                  <span className="text-green-400 font-medium">🎯 Start:</span>
                  <span className="text-white font-mono">({result.start.x}, {result.start.y})</span>
                </div>
                <div className="flex items-center justify-between bg-gray-900/50 p-2 rounded">
                  <span className="text-red-400 font-medium">🏁 End:</span>
                  <span className="text-white font-mono">({result.end.x}, {result.end.y})</span>
                </div>
              </div>

              {/* Path Details */}
              {result.path && result.path.length > 2 && (
                <div className="mt-3 text-xs">
                  <details className="group">
                    <summary className="cursor-pointer text-blue-400 hover:text-blue-300 font-medium group-open:text-blue-300">
                      📍 Path Details ({result.path.length} points) ▼
                    </summary>
                    <div className="mt-2 p-2 bg-gray-900/50 rounded text-gray-300 max-h-16 overflow-y-auto">
                      {result.path.map((point, pathIndex) => (
                        <span key={pathIndex} className="inline-block mr-1 text-xs">
                          ({point.x},{point.y})
                          {pathIndex < result.path.length - 1 && " → "}
                        </span>
                      ))}
                    </div>
                  </details>
                </div>
              )}

              {/* Error Display */}
              {result.error && (
                <div className="mt-3 text-red-300 text-sm bg-red-900/30 p-2 rounded border border-red-600">
                  <strong>⚠️ Error:</strong> {result.error}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
