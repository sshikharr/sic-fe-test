import React, { useState, useEffect } from 'react';

const HomePage = ({ onNavigateToApp }) => {
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    {
      icon: "�",
      title: "Emergency Simulation",
      description: "Model evacuation scenarios with realistic crowd behavior",
      color: "from-red-600 to-orange-600"
    },
    {
      icon: "🏙️",
      title: "Urban Planning",
      description: "Design safer cities with data-driven evacuation routes",
      color: "from-blue-600 to-teal-600"
    },
    {
      icon: "👥",
      title: "Crowd Dynamics",
      description: "Simulate multiple agents with realistic movement patterns",
      color: "from-purple-600 to-pink-600"
    },
    {
      icon: "⚠️",
      title: "Bottleneck Detection",
      description: "Identify congestion points and optimize flow efficiency",
      color: "from-yellow-600 to-red-600"
    }
  ];

  const stats = [
    { number: "500K+", label: "Evacuations Simulated" },
    { number: "150+", label: "Cities Analyzed" },
    { number: "98.5%", label: "Accuracy Rate" },
    { number: "< 50ms", label: "Response Time" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-hidden">
      {/* Navigation */}
      <nav className="relative z-50 bg-gray-800/50 backdrop-blur-lg border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-xl font-bold">🚨</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">Model Movement Control</h1>
                <p className="text-xs text-gray-400">Crowd Evacuation Simulator</p>
              </div>
            </div>
            <button
              onClick={onNavigateToApp}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
            >
              Launch App
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
              Crowd Evacuation
              <br />
              <span className="animate-pulse">Simulator</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
              Plan safer cities and optimize emergency responses with advanced crowd dynamics simulation. 
              Model evacuation scenarios, identify bottlenecks, and design efficient escape routes for urban planning.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onNavigateToApp}
                className="px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl font-semibold text-lg hover:from-red-700 hover:to-orange-700 transition-all transform hover:scale-105 shadow-2xl"
              >
                � Start Simulation
              </button>
              <button className="px-8 py-4 border-2 border-gray-600 rounded-xl font-semibold text-lg hover:border-gray-400 hover:bg-gray-800 transition-all">
                � Case Studies
              </button>
            </div>
          </div>

          {/* Animated Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`relative p-6 rounded-2xl bg-gradient-to-br ${feature.color} opacity-90 transform transition-all duration-500 hover:scale-105 hover:opacity-100 ${
                  currentFeature === index ? 'scale-105 opacity-100 shadow-2xl' : ''
                }`}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-white/90 text-sm">{feature.description}</p>
                <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 hover:opacity-100 transition-opacity"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Background Animation */}
        <div className="absolute inset-0 overflow-hidden -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-teal-600/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted by Urban Planners & Emergency Services</h2>
            <p className="text-gray-400 text-lg">Our simulation platform helps cities prepare for emergencies effectively</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-400 text-sm md:text-base">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose PathFinder AI?</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Advanced algorithms meet intuitive design for the ultimate pathfinding experience
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            {/* Left Side - Features */}
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">🎯</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Precision Pathfinding</h3>
                  <p className="text-gray-400">Advanced A* algorithm with real-time optimization for the shortest, most efficient routes.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">🌐</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Real-World Integration</h3>
                  <p className="text-gray-400">Seamlessly transition from grid practice to actual street navigation with OpenStreetMap.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">⚡</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Real-Time Processing</h3>
                  <p className="text-gray-400">Instant evacuation route calculation for time-critical emergency scenarios.</p>
                </div>
              </div>
            </div>

            {/* Right Side - Visual */}
            <div className="relative">
              <div className="w-full h-96 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">�</div>
                  <div className="text-xl font-semibold mb-2">Evacuation Simulator</div>
                  <p className="text-gray-400 mb-4">Test emergency scenarios in real-time</p>
                  <button
                    onClick={onNavigateToApp}
                    className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg font-medium hover:from-red-700 hover:to-orange-700 transition-all transform hover:scale-105"
                  >
                    Start Simulation
                  </button>
                </div>
              </div>
              {/* Floating elements */}
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-purple-500 rounded-full animate-bounce delay-500"></div>
              <div className="absolute top-1/2 -right-2 w-4 h-4 bg-teal-500 rounded-full animate-bounce delay-1000"></div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-red-900/50 to-orange-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Enhance Public Safety?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join emergency responders and urban planners using Model Movement Control for life-saving evacuation planning.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onNavigateToApp}
              className="px-10 py-4 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl font-semibold text-lg hover:from-red-700 hover:to-orange-700 transition-all transform hover:scale-105 shadow-2xl"
            >
              � Start Emergency Simulation
            </button>
            <button className="px-10 py-4 border-2 border-gray-400 rounded-xl font-semibold text-lg hover:border-white hover:bg-white/10 transition-all">
              � Emergency Response Cases
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-gray-800 border-t border-gray-700">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg flex items-center justify-center">
                  <span className="text-lg font-bold">🚨</span>
                </div>
                <span className="text-xl font-bold">Model Movement Control</span>
              </div>
              <p className="text-gray-400 mb-4">
                Advanced crowd evacuation simulation for emergency response and urban planning. Building safer communities through intelligent modeling.
              </p>
              <div className="flex space-x-4">
                <button className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-600 transition-colors">
                  📧
                </button>
                <button className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-600 transition-colors">
                  🐙
                </button>
                <button className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-600 transition-colors">
                  🐦
                </button>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Simulation Features</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Crowd Dynamics</li>
                <li>Emergency Routes</li>
                <li>Bottleneck Detection</li>
                <li>Safety Analytics</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Emergency Resources</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Planning Guidelines</li>
                <li>Case Studies</li>
                <li>Training Materials</li>
                <li>Best Practices</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Model Movement Control. Building safer communities through intelligent evacuation planning.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;