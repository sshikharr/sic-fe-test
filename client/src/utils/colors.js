// Enhanced color palette for agents
export const getAgentColor = (agentNumber) => {
  const colors = [
    '#3b82f6', // blue (moved from second to first)
    '#10b981', // emerald
    '#f59e0b', // amber
    '#8b5cf6', // violet
    '#06b6d4', // cyan
    '#84cc16', // lime
    '#f97316', // orange
    '#ec4899', // pink
    '#6366f1', // indigo
    '#14b8a6', // teal
    '#eab308', // yellow
    '#2563eb', // blue-600
    '#059669', // emerald-600
    '#d97706', // amber-600
    '#7c3aed', // violet-600
    '#0891b2', // cyan-600
    '#65a30d', // lime-600
    '#ea580c', // orange-600
    '#ef4444', // red (moved to end so it's not first)
    '#dc2626', // red-600
  ];
  
  return colors[(agentNumber - 1) % colors.length];
};