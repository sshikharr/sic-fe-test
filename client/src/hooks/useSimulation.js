import { useState, useCallback } from "react";
import { simulationService } from "../services/simulationService";

export const useSimulation = () => {
  const [simulation, setSimulation] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState(null);

  const runSimulation = useCallback(async (mapName, agents, sessionId) => {
    setIsRunning(true);
    setError(null);

    try {
      const result = await simulationService.runSimulation(
        mapName,
        agents,
        sessionId
      );
      setSimulation(result);
    } catch (err) {
      setError(err.message);
      console.error("Simulation error:", err);
    } finally {
      setIsRunning(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setSimulation(null);
    setError(null);
  }, []);

  return {
    simulation,
    isRunning,
    error,
    runSimulation,
    clearResults,
  };
};
