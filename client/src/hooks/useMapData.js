import { useState, useEffect, useCallback } from "react";
import { simulationService } from "../services/simulationService";

export const useMapData = (mapName, sessionId) => {
  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availableMaps, setAvailableMaps] = useState([]);

  // Fetch available maps
  useEffect(() => {
    const fetchAvailableMaps = async () => {
      try {
        const maps = await simulationService.getAvailableMaps();
        setAvailableMaps(maps);
      } catch (err) {
        setError("Failed to load available maps: " + err.message);
      }
    };

    fetchAvailableMaps();
  }, []);

  // Fetch specific map data
  useEffect(() => {
    const loadMap = async () => {
      if (!mapName) return;

      setLoading(true);
      setError(null);

      try {
        const data = await simulationService.getMapData(mapName, sessionId);
        setMapData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadMap();
  }, [mapName, sessionId]);

  const updateMapBlock = useCallback(
    async (x, y) => {
      if (!mapData) return;

      try {
        const result = await simulationService.updateMap(mapName, sessionId, {
          x,
          y,
        });
        if (result.success) {
          setMapData(result.updatedMap);
        }
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [mapData, mapName, sessionId]
  );

  return {
    mapData,
    loading,
    error,
    updateMapBlock,
    availableMaps,
  };
};
  