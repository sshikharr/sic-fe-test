import React from "react";

// Agent management utilities
export const createNewAgent = (existingAgents) => {
  return {
    id: existingAgents.length + 1,
    start: null,
    end: null,
    color: `hsl(${(existingAgents.length * 137.5) % 360}, 70%, 50%)`,
  };
};

export const createAgentWithStart = (existingAgents, startPoint) => {
  return {
    id: existingAgents.length + 1,
    start: startPoint,
    end: null,
    color: `hsl(${(existingAgents.length * 137.5) % 360}, 70%, 50%)`,
  };
};

export const validateAgentsForSimulation = (agents) => {
  if (agents.length === 0) {
    return { valid: false, message: "Please add at least one agent" };
  }

  const validAgents = agents.filter((agent) => agent.start && agent.end);
  if (validAgents.length === 0) {
    return { valid: false, message: "Please set start and end points for at least one agent" };
  }

  return { valid: true, validAgents };
};

// Agent interaction modes
export const AGENT_MODES = {
  NORMAL: 'normal',
  QUICK_PLACEMENT: 'quick_placement',
  SETTING_START: 'setting_start',
  SETTING_END: 'setting_end'
};

export const getAgentMode = (agentPlacementMode, isSettingStart, isSettingEnd) => {
  if (agentPlacementMode) return AGENT_MODES.QUICK_PLACEMENT;
  if (isSettingStart) return AGENT_MODES.SETTING_START;
  if (isSettingEnd) return AGENT_MODES.SETTING_END;
  return AGENT_MODES.NORMAL;
};

export const getMapClickInstruction = (mode, pendingAgent) => {
  switch (mode) {
    case AGENT_MODES.QUICK_PLACEMENT:
      return pendingAgent ? "Click to add END point" : "Click to add START point";
    case AGENT_MODES.SETTING_START:
      return "Click to set START";
    case AGENT_MODES.SETTING_END:
      return "Click to set END";
    default:
      return "";
  }
};

export const shouldShowInstruction = (mode) => {
  return mode !== AGENT_MODES.NORMAL;
};