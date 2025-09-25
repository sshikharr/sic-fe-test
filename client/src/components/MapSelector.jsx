import React from "react";

export const MapSelector = ({ selectedMap, onMapChange }) => {
  // For now, we only have the Office map, but this is expandable
  const availableMaps = ["Office"];

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center gap-4">
        <label className="text-lg font-medium">Map:</label>
        <select
          value={selectedMap}
          onChange={(e) => onMapChange(e.target.value)}
          className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {availableMaps.map((mapName) => (
            <option key={mapName} value={mapName}>
              {mapName}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
