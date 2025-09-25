import React from "react";

export const SimulationControls = ({
  onRun,
  onClear,
  isRunning,
  isBlockingMode,
  onBlockingModeToggle,
}) => {
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={onRun}
          disabled={isRunning}
          className={`px-6 py-2 rounded-lg font-medium transition-all ${
            isRunning
              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl"
          }`}
        >
          {isRunning ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full"></div>
              Running...
            </div>
          ) : (
            "Run Simulation"
          )}
        </button>

        <button
          onClick={onClear}
          className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl"
        >
          Clear Results
        </button>

        <button
          onClick={onBlockingModeToggle}
          className={`px-6 py-2 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl ${
            isBlockingMode
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-gray-600 hover:bg-gray-700 text-white"
          }`}
        >
          {isBlockingMode ? "Exit Blocking Mode" : "Blocking Mode"}
        </button>
      </div>

      {isBlockingMode && (
        <p className="text-center text-yellow-400 text-sm mt-2">
          Click on empty cells to block them
        </p>
      )}
    </div>
  );
};
