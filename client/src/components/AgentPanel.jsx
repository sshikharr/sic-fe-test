import React from "react";

export const AgentPanel = ({
  agents,
  selectedAgentIndex,
  onAgentSelect,
  onAddAgent,
  onRemoveAgent,
  onSetStart,
  onSetEnd,
  isSettingStart,
  isSettingEnd,
  agentPlacementMode,
  onToggleAgentPlacement,
  onClearAllAgents,
}) => {
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Agents</h2>
        <div className="flex gap-2">
          <button
            onClick={onToggleAgentPlacement}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              agentPlacementMode
                ? "bg-green-600 hover:bg-green-700"
                : "bg-purple-600 hover:bg-purple-700"
            }`}
          >
            {agentPlacementMode ? "✓ Place Agents" : "Quick Add Mode"}
          </button>
          <button
            onClick={onAddAgent}
            className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm font-medium transition-colors"
          >
            + Add Agent
          </button>
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {agents.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No agents added yet</p>
        ) : (
          agents.map((agent, index) => (
            <div
              key={agent.id}
              className={`border rounded-lg p-3 transition-all ${
                selectedAgentIndex === index
                  ? "border-blue-500 bg-gray-700"
                  : "border-gray-600 bg-gray-750"
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: agent.color }}
                  />
                  <span className="font-medium">Agent {agent.id}</span>
                </div>
                <button
                  onClick={() => onRemoveAgent(index)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Remove
                </button>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span>Start:</span>
                  <div className="flex items-center gap-2">
                    {agent.start ? (
                      <span className="text-green-400">
                        ({agent.start.x}, {agent.start.y})
                      </span>
                    ) : (
                      <span className="text-gray-500">Not set</span>
                    )}
                    <button
                      onClick={() => onSetStart(index)}
                      className={`px-2 py-1 rounded text-xs ${
                        isSettingStart && selectedAgentIndex === index
                          ? "bg-green-600 text-white"
                          : "bg-green-700 hover:bg-green-600 text-green-100"
                      }`}
                    >
                      Set
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span>End:</span>
                  <div className="flex items-center gap-2">
                    {agent.end ? (
                      <span className="text-red-400">
                        ({agent.end.x}, {agent.end.y})
                      </span>
                    ) : (
                      <span className="text-gray-500">Not set</span>
                    )}
                    <button
                      onClick={() => onSetEnd(index)}
                      className={`px-2 py-1 rounded text-xs ${
                        isSettingEnd && selectedAgentIndex === index
                          ? "bg-red-600 text-white"
                          : "bg-red-700 hover:bg-red-600 text-red-100"
                      }`}
                    >
                      Set
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={() =>
                  onAgentSelect(selectedAgentIndex === index ? null : index)
                }
                className={`w-full mt-2 py-1 rounded text-xs ${
                  selectedAgentIndex === index
                    ? "bg-blue-600 text-white"
                    : "bg-gray-600 hover:bg-gray-500 text-gray-200"
                }`}
              >
                {selectedAgentIndex === index ? "Selected" : "Select"}
              </button>
            </div>
          ))
        )}
      </div>

      {agents.length > 0 && (
        <div className="mt-4 space-y-2">
          <button
            onClick={onClearAllAgents}
            className="w-full bg-red-600 hover:bg-red-700 px-3 py-2 rounded text-sm font-medium transition-colors"
          >
            Clear All Agents
          </button>
          
          <div className="p-3 bg-gray-700 rounded text-xs">
            <p className="text-gray-300">
              <strong>Instructions:</strong>
            </p>
            <ul className="mt-1 text-gray-400 space-y-1">
              {agentPlacementMode ? (
                <>
                  <li>• Click on the grid to add agents with start points</li>
                  <li>• Click again on a different cell to set end point</li>
                  <li>• Toggle off "Place Agents" when done</li>
                </>
              ) : (
                <>
                  <li>• Select an agent and click "Set" to define start/end points</li>
                  <li>• Click on the grid to place the selected point</li>
                  <li>• Use "Quick Add Mode" for faster agent placement</li>
                </>
              )}
              <li>• Run simulation to see pathfinding results</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
