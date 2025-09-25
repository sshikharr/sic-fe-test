const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize the Gemini model
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

exports.analyzeLocation = async (req, res) => {
  const { lat, lng } = req.body;

  if (lat === undefined || lng === undefined) {
    return res.status(400).json({ error: "Latitude and longitude are required." });
  }

  // Enhanced prompt with better formatting and highlighting
  const prompt = `
You are an expert emergency management analyst and disaster risk assessment specialist. Conduct a comprehensive analysis of the geographic location at coordinates ${lat}, ${lng}.

CRITICAL INSTRUCTIONS:
- Return ONLY a valid JSON object with no additional text, markdown, or explanations
- Use exact key names as specified below
- Ensure all data is accurate, current, and sourced from reliable databases
- Cross-reference multiple data sources for accuracy
- Format content for easy readability in web display
- Use color highlighting for important information 

REQUIRED JSON STRUCTURE:

{
  "riskLevel": "[VALUE]",
  "disasterHistory": "[VALUE]", 
  "populationInfo": "[VALUE]",
  "emergencyContacts": "[VALUE]",
  "nearestHospital": "[VALUE]",
  "nearestShelter": "[VALUE]",
  "riskFactors": "[VALUE]",
  "evacuationRoutes": "[VALUE]",
  "weatherPatterns": "[VALUE]",
  "geologicalInfo": "[VALUE]"
}

DETAILED SPECIFICATIONS:

1. "riskLevel": Classify as one of: "Critical", "High", "Moderate", "Low", "Minimal"
   - Base assessment on: seismic activity, flood zones, wildfire risk, hurricane paths, industrial hazards, population density.
   give simple text only without boiler plate code.

2. "disasterHistory": Historical disaster analysis (last 50 years):
   - Format: "• [Year]: [Major Event] - [Impact/Casualties]<br>• [Year]: [Event] - [Impact]"
   - Include: earthquakes >4.0, major floods, wildfires >1000 acres, hurricanes Cat 2+
   - If minimal history: "• No significant disasters recorded in past 50 years"
   - Highlight years with [Year]
   give simple text only without boiler plate code.

3. "populationInfo": Demographics and density:
   - Format: "Population: [X,XXX] | [Urban/Suburban/Rural] area | Density: [X] per km² | [Primary demographic characteristics]"
   - Include vulnerable populations (elderly %, children %, disability rates)
   - Highlight population number with Population: [X,XXX]
   give simple text only without boiler plate code.

4. "emergencyContacts": Local emergency services:
   - Format: "🚓 Police: [Number] | 🚑 Ambulance: [Number] | 🚒 Fire: [Number] | ⚠️ Emergency Mgmt: [Number]"
   - Include country/region-specific emergency numbers
   - Highlight service names with Police.give simple text only without boiler plate code.

5. "nearestHospital": Closest major medical facility:
   - Format: "[Hospital Name] - [X.X km] away | Level [I/II/III/IV] Trauma Center | Specialties: [Key services]"
   - Highlight hospital name with [Hospital Name]give simple text only without boiler plate code.

6. "nearestShelter": Emergency evacuation shelter:
   - Format: "[Shelter Name/Type] - [X.X km] away | Capacity: [XXX] people | Services: [Available amenities]"
   - Highlight shelter name with [Shelter Name/Type].give simple text only without boiler plate code.

7. "riskFactors": Current threat assessment:
   - Format: "• Seismic: [Risk level]• Flood: [Zone/Risk]• Fire: [Wildfire index]• Weather: [Severe weather frequency]• Industrial: [Hazmat facilities nearby]"
   - Highlight risk categories with Seismic:
     give simple text only without boiler plate code.

8. "evacuationRoutes": Primary escape routes:
   - Format: "Primary: [Route description] Secondary: [Alternative route] Assembly Point: [Location] - [X.X km]"
   - Highlight route types with Primary:.give simple text only without boiler plate code.

9. "weatherPatterns": Climate and seasonal risks:
   - Format: "• Severe Weather: [Frequency/season]• Natural Hazards: [Seasonal risks]• Climate Trend: [Long-term changes]"
   - Highlight weather categories with Severe Weather:.give simple text only without boiler plate code.

10. "geologicalInfo": Ground stability and seismic data:
    - Format: "• Fault Lines: [Distance to nearest]• Soil Type: [Stability rating]• Seismic Zone: [Classification]• Landslide Risk: [Assessment]"
    - Highlight geological categories with Fault Lines:.give simple text only without boiler plate code.

ACCURACY REQUIREMENTS:
- Use real geographic data and current information
- Verify coordinates correspond to actual location names/addresses
- Include metric distances with one decimal place
- Use 24-hour format for any time references
- Include country/region-specific emergency protocols
- Format phone numbers according to local standards
- Ensure the response is in plain text (no boiler plate code) and valid JSON



ADDITIONAL ENHANCEMENTS:
- Provide specific street names and landmarks where possible
- Include alternate contact methods (websites, apps) for emergency services
- Mention any recent infrastructure changes or new developments
- Reference official government emergency management sources
- Include accessibility information for disabled individuals
- Mention multi-language emergency service availability if applicable

Return the complete JSON object with all 10 fields populated with accurate, actionable emergency management data formatted for web display with color-highlighted important information.
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean the response to ensure it's valid JSON
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    // Parse the JSON string into an object
    const analysisData = JSON.parse(text);

    res.json({ success: true, data: analysisData });
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ 
      error: "Failed to get analysis from AI model.",
      details: error.message 
    });
  }
};