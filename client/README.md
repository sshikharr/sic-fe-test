# Real-World Pathfinding Simulation

A sophisticated pathfinding simulation that works with both grid-based practice environments and real-world maps using Mapbox GL JS.

## Features

### Grid Mode (Practice)

- ✅ Clean SVG line visualization (no more "snake" patterns)
- ✅ Light theme with walking paths and blocked areas
- ✅ Sequential agent placement with numbered agents
- ✅ Multiple agent pathfinding with different colors
- ✅ Real-time path recalculation when blocking/unblocking cells
- ✅ Unreachable path indicators with crossed lines

### Map Mode (Real World)

- 🗺️ Real-world maps powered by Mapbox GL JS
- 📍 Click-to-place agents anywhere on the map
- 🛣️ Walking route pathfinding using Mapbox Directions API
- 🎨 Multi-colored paths for different agents
- 🔄 Real-time simulation controls

## Setup Instructions

### 1. Install Dependencies

```bash
cd client
npm install
```

### 2. Get Mapbox Access Token

1. Go to [Mapbox Account](https://account.mapbox.com/access-tokens/)
2. Create a new access token or copy an existing one
3. Create a `.env` file in the `client` directory:

```env
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token_here
```

**Example format:**

```env
VITE_MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6ImNsYWJjZGVmIn0.example_token_string
```

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5175/` (or another port if 5175 is busy).

## Usage Guide

### Switching Between Modes

- Use the toggle buttons in the header: **🔲 Grid Mode** and **🗺️ Map Mode**

### Grid Mode Usage

1. **Quick Add Mode**: Enable to sequentially place agents with two clicks (start → end)
2. **Block Mode**: Click cells to add/remove obstacles
3. **Run Simulation**: Calculate paths for all agents
4. **Clear All**: Remove all agents and results

### Map Mode Usage

1. **Place Agents**: Click anywhere on the map to place agent start/end points
2. **Run Simulation**: Calculate real-world walking routes
3. **Clear All**: Remove all agents and paths
4. **View Controls**: Pan, zoom, and navigate the map

## Technical Architecture

### Frontend Structure

```
src/
├── components/
│   ├── MapGrid.jsx           # Grid-based pathfinding (practice)
│   ├── MapboxPathfinding.jsx # Real-world map pathfinding
│   ├── AgentManager.jsx      # Agent validation and management
│   ├── SimulationControls.jsx
│   └── ResultsPanel.jsx
├── hooks/
│   ├── useSimulation.js      # Simulation state management
│   └── useMapData.js         # Grid map data handling
├── services/
│   └── simulationService.js  # API communication
├── utils/
│   └── colors.js            # Agent color palette
└── App.jsx                  # Main app with mode switching
```

### Backend Structure

```
server/
├── controllers/
│   └── simulationController.js
├── services/
│   └── mapStore.js
├── utils/
│   └── pathfinding.js       # A* algorithm for grid
└── routes/
    └── simulationRoutes.js
```

## API Integration

### Grid Mode

- **Backend API**: Custom pathfinding service with A\* algorithm
- **Endpoint**: `POST /api/simulation/run`

### Map Mode

- **Mapbox GL JS**: Interactive map rendering
- **Mapbox Directions API**: Real-world route calculation
- **Walking profiles**: Optimized for pedestrian navigation

## Color System

Agent colors are automatically assigned from a 20-color palette designed for maximum distinction:

- Colors avoid confusion (red moved from first position)
- Each agent gets a unique color with proper contrast
- Paths match agent marker colors

## Development Notes

### Resolved Issues

- ✅ Eliminated "snake" pattern visualization
- ✅ Removed blue background clutter from paths
- ✅ Fixed React hook dependencies
- ✅ Clean SVG line rendering system
- ✅ Proper error handling for unreachable paths

### Environment Variables

- `VITE_MAPBOX_ACCESS_TOKEN`: Required for map functionality
- Stored in `.env` file (ignored by git)

## Troubleshooting

### Common Issues

**1. "MapboxAccessToken is required" error**

- Ensure your `.env` file exists in the `client` directory
- Verify the access token format is correct
- Restart the development server after adding the token

**2. Map loads but no interactions work**

- Check browser console for API errors
- Verify access token has proper permissions
- Check network connectivity

**3. Paths not displaying**

- Ensure agents have both start and end points
- Check that locations are reachable via walking routes
- Verify Directions API quota isn't exceeded

**4. Grid mode works but map mode doesn't**

- This is normal if Mapbox token isn't configured
- Grid mode works independently of Mapbox services

## Next Steps

- [ ] Add animation for path drawing
- [ ] Implement collision detection between agents
- [ ] Add mobile responsiveness
- [ ] Include traffic-aware routing options
- [ ] Export simulation results
- [ ] Save/load agent configurations

## License

This project is for educational and development purposes.

# Model Movement Control - Frontend

This is the frontend application for the Model Movement Control system, a pathfinding and crowd simulation tool.

## Environment Configuration

The application uses environment variables for configuration. Create the following files based on your environment:

### Development

Create a `.env.development` file:

```
VITE_API_URL=http://localhost:5000
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token
```

### Production

Create a `.env.production` file:

```
VITE_API_URL=https://your-production-api-url.com
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token
```

## Development

```bash
npm install
npm run dev
```

## Building for Production

```bash
npm run build:production
```

The built files will be in the `dist` directory, ready to be deployed to a static hosting service.

## Deployment Options

### Option 1: Netlify

1. Connect your repository to Netlify
2. Set the build command to `npm run build:production`
3. Set the publish directory to `dist`
4. Add your environment variables in the Netlify dashboard

### Option 2: Vercel

1. Connect your repository to Vercel
2. Vercel will automatically detect Vite and use the correct settings
3. Add your environment variables in the Vercel dashboard

### Option 3: Static Hosting

1. Run `npm run build:production`
2. Upload the contents of the `dist` directory to your hosting provider
