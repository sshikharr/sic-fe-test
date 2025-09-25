// Get API URL from environment, with fallback for development
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

class SimulationService {
  // Error handling helper
  async handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Server responded with ${response.status}`
      );
    }
    return response.json();
  }

  async runSimulation(mapName, agents, sessionId) {
    const response = await fetch(`${API_BASE_URL}/api/simulation/run`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mapName,
        agents,
        sessionId,
      }),
    });

    return this.handleResponse(response);
  }

  async updateMap(mapName, sessionId, block) {
    const response = await fetch(`${API_BASE_URL}/api/simulation/update-map`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mapName,
        sessionId,
        block,
      }),
    });

    return this.handleResponse(response);
  }

  async getAvailableMaps() {
    const response = await fetch(`${API_BASE_URL}/api/simulation/maps`);
    const data = await this.handleResponse(response);
    return data.maps;
  }

  async getMapData(mapName, sessionId = null) {
    const url = sessionId
      ? `${API_BASE_URL}/api/simulation/maps/${mapName}/${sessionId}`
      : `${API_BASE_URL}/api/simulation/maps/${mapName}`;

    const response = await fetch(url);
    const data = await this.handleResponse(response);
    return data.mapData;
  }
}

export const simulationService = new SimulationService();
