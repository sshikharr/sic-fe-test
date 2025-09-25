import React from 'react';

const LocationAnalysisPanel = ({ analysis, isLoading, error, onClear }) => {
  const getRiskColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'critical':
        return 'bg-red-600 border-red-500 text-white';
      case 'high':
        return 'bg-orange-600 border-orange-500 text-white';
      case 'moderate':
        return 'bg-yellow-500 border-yellow-400 text-black';
      case 'low':
        return 'bg-green-500 border-green-400 text-white';
      case 'minimal':
        return 'bg-blue-500 border-blue-400 text-white';
      default:
        return 'bg-blue-500 border-blue-400 text-white';
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold flex items-center">
          <span className="mr-2">🤖</span>AI Location Analysis
        </h3>
        <button 
          onClick={onClear} 
          className="text-gray-400 hover:text-white text-2xl font-bold"
          title="Clear Analysis"
        >
          &times;
        </button>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center p-8">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-300">Analyzing location...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg">
          <p className="font-bold">Analysis Failed</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {analysis && !isLoading && (
        <div className="space-y-5 max-h-96 overflow-y-auto">
          {/* Risk Level */}
          <div>
            <h4 className="font-semibold text-gray-300 mb-2">🚨 Risk Level</h4>
            <div className={`px-4 py-2 rounded-lg text-center font-bold text-lg ${getRiskColor(analysis.riskLevel)}`}>
              {analysis.riskLevel || 'N/A'}
            </div>
          </div>
          
          {/* Emergency Contacts */}
          <div>
            <h4 className="font-semibold text-gray-300 mb-2">📞 Emergency Contacts</h4>
            <div className="bg-gray-700/80 p-3 rounded-lg text-gray-200 text-sm leading-relaxed font-mono">
              {analysis.emergencyContacts || 'No data available.'}
            </div>
          </div>

          {/* Nearest Hospital */}
          <div>
            <h4 className="font-semibold text-gray-300 mb-2">🏥 Nearest Hospital</h4>
            <p className="bg-gray-700/80 p-3 rounded-lg text-gray-200 text-sm leading-relaxed">
              {analysis.nearestHospital || 'No data available.'}
            </p>
          </div>

          {/* Nearest Shelter */}
          <div>
            <h4 className="font-semibold text-gray-300 mb-2">🏠 Nearest Shelter</h4>
            <p className="bg-gray-700/80 p-3 rounded-lg text-gray-200 text-sm leading-relaxed">
              {analysis.nearestShelter || 'No data available.'}
            </p>
          </div>

          {/* Evacuation Routes */}
          <div>
            <h4 className="font-semibold text-gray-300 mb-2">🚗 Evacuation Routes</h4>
            <p className="bg-gray-700/80 p-3 rounded-lg text-gray-200 text-sm leading-relaxed">
              {analysis.evacuationRoutes || 'No data available.'}
            </p>
          </div>

          {/* Risk Factors */}
          <div>
            <h4 className="font-semibold text-gray-300 mb-2">⚠️ Risk Factors</h4>
            <div className="bg-gray-700/80 p-3 rounded-lg text-gray-200 text-sm leading-relaxed">
              {analysis.riskFactors || 'No data available.'}
            </div>
          </div>

          {/* Disaster History */}
          <div>
            <h4 className="font-semibold text-gray-300 mb-2">📜 Disaster History</h4>
            <div className="bg-gray-700/80 p-3 rounded-lg text-gray-200 text-sm leading-relaxed">
              {analysis.disasterHistory || 'No data available.'}
            </div>
          </div>

          {/* Population Info */}
          <div>
            <h4 className="font-semibold text-gray-300 mb-2">👥 Population Info</h4>
            <p className="bg-gray-700/80 p-3 rounded-lg text-gray-200 text-sm leading-relaxed">
              {analysis.populationInfo || 'No data available.'}
            </p>
          </div>

          {/* Weather Patterns */}
          <div>
            <h4 className="font-semibold text-gray-300 mb-2">🌤️ Weather Patterns</h4>
            <div className="bg-gray-700/80 p-3 rounded-lg text-gray-200 text-sm leading-relaxed">
              {analysis.weatherPatterns || 'No data available.'}
            </div>
          </div>

          {/* Geological Info */}
          <div>
            <h4 className="font-semibold text-gray-300 mb-2">🌍 Geological Info</h4>
            <div className="bg-gray-700/80 p-3 rounded-lg text-gray-200 text-sm leading-relaxed">
              {analysis.geologicalInfo || 'No data available.'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationAnalysisPanel;