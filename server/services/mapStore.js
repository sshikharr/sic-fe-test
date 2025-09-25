const maps = require("../data/maps.json");

const mapStore = {
  originals: maps,
  sessions: {}, 
};
const cleanupSessions = () => {
  const now = Date.now();
  Object.keys(mapStore.sessions).forEach(sessionId => {
    if (mapStore.sessions[sessionId].lastUsed < now - 3600000) {
      delete mapStore.sessions[sessionId];
    }
  });
};

setInterval(cleanupSessions, 3600000);

module.exports = mapStore;