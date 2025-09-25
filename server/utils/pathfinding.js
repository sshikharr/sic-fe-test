const TinyQueue = require("tinyqueue");

function heuristic(a, b) {
  const dx = Math.abs(a.x - b.x);
  const dy = Math.abs(a.y - b.y);
  return dx + dy; // A simple Manhattan distance is usually sufficient
}

function findPath(grid, start, end) {
  if (start.x === end.x && start.y === end.y) {
    return [start];
  }

  // Use TinyQueue directly without 'new' keyword
  const openSet = TinyQueue([], (a, b) => a.f - b.f);

  const closedSet = new Set();
  const cameFrom = {};
  const gScore = {};

  const key = (p) => `${p.x},${p.y}`;
  const startKey = key(start);

  gScore[startKey] = 0;
  const startFScore = heuristic(start, end);

  openSet.push({ node: start, f: startFScore });

  let iterations = 0;
  const maxIterations = grid.length * grid[0].length * 5;

  while (openSet.length > 0 && iterations < maxIterations) {
    iterations++;

    const { node: current } = openSet.pop();
    const currentKey = key(current);
    if (closedSet.has(currentKey)) {
      continue;
    }

    closedSet.add(currentKey);

    if (current.x === end.x && current.y === end.y) {
      let path = [current];
      let k = currentKey;
      while (cameFrom[k]) {
        path.unshift(cameFrom[k]);
        k = key(cameFrom[k]);
      }
      return path;
    }

    const neighbors = [
      { x: current.x + 1, y: current.y, cost: 1 },
      { x: current.x - 1, y: current.y, cost: 1 },
      { x: current.x, y: current.y + 1, cost: 1 },
      { x: current.x, y: current.y - 1, cost: 1 },
    ];

    for (const neighbor of neighbors) {
      const neighborKey = key(neighbor);

      if (
        neighbor.x < 0 ||
        neighbor.y < 0 ||
        neighbor.x >= grid[0].length ||
        neighbor.y >= grid.length ||
        grid[neighbor.y][neighbor.x] === 1 ||
        closedSet.has(neighborKey)
      ) {
        continue;
      }

      const tentativeG = (gScore[currentKey] || 0) + neighbor.cost;

      if (tentativeG < (gScore[neighborKey] || Infinity)) {
        cameFrom[neighborKey] = current;
        gScore[neighborKey] = tentativeG;
        const fScore = tentativeG + heuristic(neighbor, end);

        openSet.push({ node: neighbor, f: fScore });
      }
    }
  }

  console.log(
    `Pathfinding completed after ${iterations} iterations - no path found`
  );
  return []; // No path found
}

module.exports = { findPath };
