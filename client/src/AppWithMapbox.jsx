import React, { useState } from "react";
import { MapGrid } from "./components/MapGrid";
import MapboxPathfinding from "./components/MapboxPathfinding";

function App() {
  const [viewMode, setViewMode] = useState("mapbox"); // 'grid' or 'mapbox'

  return (
    <div className="h-screen w-screen bg-gray-900">
      {/* View Toggle */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
        <div className="bg-white rounded-lg shadow-lg p-2 flex gap-2">
          <button
            onClick={() => setViewMode("grid")}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              viewMode === "grid"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            🔲 Grid Mode
          </button>
          <button
            onClick={() => setViewMode("mapbox")}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              viewMode === "mapbox"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            🗺️ Map Mode
          </button>
        </div>
      </div>

      {/* Render appropriate view */}
      {viewMode === "mapbox" ? (
        <MapboxPathfinding />
      ) : (
        <div className="h-full w-full pt-16">
          <MapGrid />
        </div>
      )}
    </div>
  );
}

export default App;
