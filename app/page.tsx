'use client';

import { useState, useEffect, useRef } from 'react';

interface AICoordinates {
  desperate: number;
  performative: number;
  cry_for_help: number;
  ragebaiter: number;
}

interface AIResponse {
  coordinates: AICoordinates;
  confidence: number;
  reasoning: string;
  key_indicators: string[];
}

interface UserData {
  username: string;
  profilePicture: string;
  coordinates: AICoordinates;
  percentages: {
    desperate: number;
    performative: number;
    cry_for_help: number;
    ragebaiter: number;
  };
  quadrant: 'desperate' | 'performative' | 'cry-for-help' | 'ragebaiter' | null;
  analysis: string;
  confidence: number;
}

export default function Home() {
  const [username, setUsername] = useState('');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [profilePosition, setProfilePosition] = useState({ x: 50, y: 50 });
  const [isDownloading, setIsDownloading] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const downloadAreaRef = useRef<HTMLDivElement>(null);

  // Roaming animation during analysis - Move through all quadrants
  useEffect(() => {
    if (!isAnalyzing) return;

    let quadrantIndex = 0;
    const quadrantPositions = [
      { x: 25, y: 25 }, // Top-left (Desperate)
      { x: 75, y: 25 }, // Top-right (Performative)
      { x: 25, y: 75 }, // Bottom-left (Cry for Help)
      { x: 75, y: 75 }, // Bottom-right (Ragebaiter)
    ];

    const interval = setInterval(() => {
      // Add some randomness around each quadrant center
      const basePosition = quadrantPositions[quadrantIndex];
      const randomOffset = {
        x: (Math.random() - 0.5) * 15, // Random offset ±7.5%
        y: (Math.random() - 0.5) * 15
      };
      
      setProfilePosition({
        x: Math.max(15, Math.min(85, basePosition.x + randomOffset.x)),
        y: Math.max(15, Math.min(85, basePosition.y + randomOffset.y))
      });
      
      quadrantIndex = (quadrantIndex + 1) % quadrantPositions.length;
    }, 800);

    return () => clearInterval(interval);
  }, [isAnalyzing]);

  // Convert AI coordinates to quadrant placement
  const getQuadrantFromCoordinates = (coordinates: AICoordinates): 'desperate' | 'performative' | 'cry-for-help' | 'ragebaiter' => {
    // Find the highest coordinate value to determine dominant quadrant
    const maxValue = Math.max(...Object.values(coordinates));
    
    if (coordinates.desperate === maxValue) return 'desperate';
    if (coordinates.performative === maxValue) return 'performative';
    if (coordinates.cry_for_help === maxValue) return 'cry-for-help';
    return 'ragebaiter';
  };

  // Convert coordinates to visual position on the grid
  const getPositionFromCoordinates = (coordinates: AICoordinates) => {
    // Map coordinates to grid positions
    // desperate: top-left, performative: top-right, cry_for_help: bottom-left, ragebaiter: bottom-right
    
    // Determine the dominant quadrant
    const maxValue = Math.max(...Object.values(coordinates));
    let quadrantPosition;
    
    if (coordinates.desperate === maxValue) {
      quadrantPosition = { x: 25, y: 25 }; // Top-left
    } else if (coordinates.performative === maxValue) {
      quadrantPosition = { x: 75, y: 25 }; // Top-right
    } else if (coordinates.cry_for_help === maxValue) {
      quadrantPosition = { x: 25, y: 75 }; // Bottom-left
    } else {
      quadrantPosition = { x: 75, y: 75 }; // Bottom-right (ragebaiter)
    }
    
    return quadrantPosition;
  };

  // Download chart as PNG image
  const downloadChart = async () => {
    if (!downloadAreaRef.current || !userData) return;
    
    setIsDownloading(true);
    
    try {
      // Dynamic import of html2canvas
      const html2canvas = (await import('html2canvas')).default;

      // Brief delay to ensure DOM is ready
      await new Promise(resolve => setTimeout(resolve, 100));

      // Ensure the final verdict element is visible and rendered
      const finalVerdictElement = downloadAreaRef.current.querySelector('.final-verdict-container') as HTMLElement;
      if (finalVerdictElement) {
        finalVerdictElement.style.display = 'block';
        finalVerdictElement.style.visibility = 'visible';
      }

      // Create canvas with settings optimized for both text and images
      const canvas = await html2canvas(downloadAreaRef.current, {
        background: '#EF88AD',
        useCORS: true,
        allowTaint: true,
        logging: false,
      });

      
      // Convert canvas to blob and download
      canvas.toBlob((blob: Blob | null) => {
        if (blob) {
          // Create download link
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${userData.username}-personality-chart.png`;
          
          // Trigger download
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Clean up
          URL.revokeObjectURL(url);
          
          // Success feedback
          alert('Chart downloaded successfully! 📥');
        } else {
          throw new Error('Failed to create image blob');
        }
      }, 'image/png', 0.95); // High quality PNG
      
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download chart. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const analyzeUser = async () => {
    if (!username.trim()) return;
    
    setIsAnalyzing(true);
    
    try {
      const response = await fetch('/api/analyze-twitter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username.trim() }),
      });
      
      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(errorData.error || 'Failed to analyze user');
      // }

      const aiResponse: AIResponse = await response.json();
      
      // Determine quadrant and position from AI coordinates
      const quadrant = getQuadrantFromCoordinates(aiResponse.coordinates);
      const position = getPositionFromCoordinates(aiResponse.coordinates);
      
      // Convert coordinates to percentages for better readability
      const coordinatePercentages = {
        desperate: Math.round(((aiResponse.coordinates.desperate + 1) / 2) * 100),
        performative: Math.round(((aiResponse.coordinates.performative + 1) / 2) * 100),
        cry_for_help: Math.round(((aiResponse.coordinates.cry_for_help + 1) / 2) * 100),
        ragebaiter: Math.round(((aiResponse.coordinates.ragebaiter + 1) / 2) * 100)
      };

      // Generate analysis text
      const getIntensityLevel = (percentage: number) => {
        if (percentage >= 80) return 'extremely high';
        if (percentage >= 60) return 'high';
        if (percentage >= 40) return 'moderate';
        if (percentage >= 20) return 'low';
        return 'very low';
      };

      const analysis = `Analysis shows this user is ${quadrant === 'desperate' ? 'desperately seeking validation and attention' : quadrant === 'performative' ? 'performing for an audience rather than being authentic' : quadrant === 'cry-for-help' ? 'expressing genuine distress and seeking support' : 'intentionally provoking reactions and controversy'}. Their behavior breakdown: ${coordinatePercentages.desperate}% desperate tendencies (${getIntensityLevel(coordinatePercentages.desperate)}), ${coordinatePercentages.performative}% performative behavior (${getIntensityLevel(coordinatePercentages.performative)}), ${coordinatePercentages.cry_for_help}% cry for help signals (${getIntensityLevel(coordinatePercentages.cry_for_help)}), and ${coordinatePercentages.ragebaiter}% rage-baiting content (${getIntensityLevel(coordinatePercentages.ragebaiter)}).`;
      
      setUserData({
        username: username.trim(),
        profilePicture: '/apple-fun.jpg',
        coordinates: aiResponse.coordinates,
        percentages: coordinatePercentages,
        quadrant: quadrant,
        analysis: analysis,
        confidence: aiResponse.confidence
      });
      
      // Move profile picture to calculated position
      setProfilePosition(position);
      
    } catch (error) {
      console.error('Analysis error:', error);
      alert(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsAnalyzing(false);
      setUsername('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      analyzeUser();
    }
  };

  return (
    <div className="min-h-screen bg-[#EF88AD] text-black p-6 font-comic">
      {/* Download Area - includes header and main content */}
      <div ref={downloadAreaRef} className="bg-[#EF88AD] p-6">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-3 sm:mb-4">
            <span className="text-white">oomf-</span>
            <span className="text-white">analyzer</span>
          </h1>
          <p className="text-[#670D2F] text-base sm:text-lg font-medium">
            discover your twitter personality type
          </p>
        </div>

        {/* Final Verdict - Show after analysis */}
        {userData && (
          <div className="text-center mb-4 sm:mb-6 final-verdict-container">
            <div className="inline-block bg-white border-2 border-[#670D2F] rounded-lg px-4 sm:px-6 py-2 sm:py-3 shadow-lg"
                 style={{ backgroundColor: 'white', border: '2px solid #670D2F', minHeight: '60px', position: 'relative', zIndex: 1 }}>
              <p className="text-xs text-[#670D2F] font-bold mb-1"
                 style={{ color: '#670D2F', fontWeight: 'bold', fontSize: '12px' }}>
                FINAL VERDICT
              </p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-black"
                 style={{ color: 'black', fontWeight: 'bold', fontSize: '18px' }}>
                {userData.quadrant?.toUpperCase().replace('-', ' ')}
              </p>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="w-full max-w-sm sm:max-w-md md:max-w-lg mx-auto mb-8 px-4">
        {/* Quadrant Grid - FIXED POSITIONING */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-lg mb-4 relative overflow-visible" ref={chartRef}>
          {/* Grid Background */}
          <div className="absolute inset-0 opacity-30">
            <svg className="w-full h-full">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#d1d5db" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
          
          <div className="grid grid-cols-2 gap-0 aspect-square relative bg-white/60 backdrop-blur-sm rounded-lg border border-gray-300/50 w-full mx-auto">
            {/* Central Dividing Lines */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-400/60"></div>
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-400/60"></div>
            </div>
            
            {/* Desperate - Top Left */}
            <div className="bg-gradient-to-br from-pink-100/60 to-pink-200/40 border-r border-b border-gray-300/50 relative flex items-center justify-center group hover:from-pink-200/80 hover:to-pink-300/60 transition-all duration-300">
              <div className="absolute inset-0 bg-pink-500/5"></div>
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-20">
                <span className="text-xs sm:text-sm font-bold text-pink-600 bg-pink-50/90 px-2 py-1 rounded-full border border-pink-300 shadow-sm">
                  Desperate
                </span>
              </div>
              {userData?.quadrant === 'desperate' && !isAnalyzing && (
                <div className="absolute inset-0 flex items-center justify-center z-30">
                  <div className="text-center">
                    <img
                      src="/apple-fun.jpg"
                      alt={userData.username}
                      className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full border-2 sm:border-3 border-[#A53860] shadow-lg ring-1 sm:ring-2 ring-[#EF88AD] object-cover mx-auto"
                    />
                    <div className="mt-1 text-xs font-bold text-[#A53860] bg-white/95 px-2 py-0.5 rounded-full border border-[#A53860]/30 shadow-sm">
                      @{userData.username}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Performative - Top Right */}
            <div className="bg-gradient-to-bl from-gray-100/60 to-gray-200/40 border-l border-b border-gray-300/50 relative flex items-center justify-center group hover:from-gray-200/80 hover:to-gray-300/60 transition-all duration-300">
              <div className="absolute inset-0 bg-gray-600/5"></div>
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-20">
                <span className="text-xs sm:text-sm font-bold text-gray-800 bg-gray-100/90 px-2 py-1 rounded-full border border-gray-400 shadow-sm">
                  Performative
                </span>
              </div>
              {userData?.quadrant === 'performative' && !isAnalyzing && (
                <div className="absolute inset-0 flex items-center justify-center z-30">
                  <div className="text-center">
                    <img
                      src="/apple-fun.jpg"
                      alt={userData.username}
                      className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full border-2 sm:border-3 border-[#A53860] shadow-lg ring-1 sm:ring-2 ring-[#EF88AD] object-cover mx-auto"
                    />
                    <div className="mt-1 text-xs font-bold text-[#A53860] bg-white/95 px-2 py-0.5 rounded-full border border-[#A53860]/30 shadow-sm">
                      @{userData.username}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Cry for Help - Bottom Left */}
            <div className="bg-gradient-to-tr from-blue-100/60 to-blue-200/40 border-r border-t border-gray-300/50 relative flex items-center justify-center group hover:from-blue-200/80 hover:to-blue-300/60 transition-all duration-300">
              <div className="absolute inset-0 bg-blue-500/5"></div>
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-20">
                <span className="text-xs sm:text-sm font-bold text-blue-600 bg-blue-50/90 px-2 py-1 rounded-full border border-blue-300 shadow-sm whitespace-nowrap">
                  Cry For Help
                </span>
              </div>
              {userData?.quadrant === 'cry-for-help' && !isAnalyzing && (
                <div className="absolute inset-0 flex items-center justify-center z-30">
                  <div className="text-center">
                    <img
                      src="/apple-fun.jpg"
                      alt={userData.username}
                      className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full border-2 sm:border-3 border-blue-500 shadow-lg ring-1 sm:ring-2 ring-blue-200 object-cover mx-auto"
                    />
                    <div className="mt-1 text-xs font-bold text-blue-600 bg-white/95 px-2 py-0.5 rounded-full border border-blue-500/30 shadow-sm">
                      @{userData.username}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Ragebaiter - Bottom Right */}
            <div className="bg-gradient-to-tl from-green-100/60 to-green-200/40 border-l border-t border-gray-300/50 relative flex items-center justify-center group hover:from-green-200/80 hover:to-green-300/60 transition-all duration-300">
              <div className="absolute inset-0 bg-green-500/5"></div>
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-20">
                <span className="text-xs sm:text-sm font-bold text-green-600 bg-green-50/90 px-2 py-1 rounded-full border border-green-300 shadow-sm">
                  Ragebaiter
                </span>
              </div>
              {userData?.quadrant === 'ragebaiter' && !isAnalyzing && (
                <div className="absolute inset-0 flex items-center justify-center z-30">
                  <div className="text-center">
                    <img
                      src="/apple-fun.jpg"
                      alt={userData.username}
                      className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full border-2 sm:border-3 border-green-500 shadow-lg ring-1 sm:ring-2 ring-green-200 object-cover mx-auto"
                    />
                    <div className="mt-1 text-xs font-bold text-green-600 bg-white/95 px-2 py-0.5 rounded-full border border-green-500/30 shadow-sm">
                      @{userData.username}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Username Input - Under the Chart */}
        <div className="text-center px-4 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-6 text-black">personality analyzer</h2>
          <p className="text-gray-800 mb-4 sm:mb-6 text-sm sm:text-base font-medium">enter your username and discover your twitter behavior type</p>
          
          <div className="max-w-md mx-auto space-y-5">
            <input
              type="text"
              placeholder="@username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full bg-white border-2 border-[#A53860] text-gray-900 placeholder-gray-600 text-base sm:text-lg p-3 sm:p-4 h-12 sm:h-14 rounded-lg font-comic focus:border-[#3A0519] focus:outline-none transition-colors"
            />
            <p className="text-[#670D2F] text-sm text-center font-medium">
              Just type the username without the @ symbol
            </p>
            <button
              onClick={analyzeUser}
              disabled={isAnalyzing || !username}
              className="w-full bg-[#A53860] hover:bg-[#670D2F] text-white text-base sm:text-lg p-3 sm:p-4 h-12 sm:h-14 rounded-lg font-comic border-2 border-[#A53860] hover:border-[#670D2F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? 'analyzing...' : 'see results'}
            </button>
          </div>
        </div>
        </div>
      </div>

      {/* Download Chart Button - Only show when results are available */}
      {userData && (
        <div className="w-full max-w-sm sm:max-w-md md:max-w-lg mx-auto mb-8 text-center px-4">
          <button
            onClick={downloadChart}
            disabled={isDownloading}
            className="bg-[#670D2F] hover:bg-[#3A0519] text-white text-base lg:text-lg px-8 py-4 rounded-lg font-comic border-2 border-[#670D2F] hover:border-[#3A0519] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-bold"
          >
            {isDownloading ? 'downloading...' : '📥 download chart as image'}
          </button>
          <p className="text-gray-800 text-xs sm:text-sm mt-3 font-medium">
            Download your personality chart with profile picture as a PNG image
          </p>
        </div>
      )}

      {/* Roaming Avatar - OVERLAID ON CHART */}
      {isAnalyzing && (
        <div className="w-full max-w-sm sm:max-w-md md:max-w-lg mx-auto mb-6 relative pointer-events-none" style={{ marginTop: '-360px', height: '280px', zIndex: 10 }}>
          <div className="absolute inset-0 flex justify-center">
            <div className="relative w-full">
              <div
                className="absolute w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 transition-all duration-700 ease-in-out"
                style={{
                  left: `${profilePosition.x}%`,
                  top: `${profilePosition.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <img
                  src="/apple-fun.jpg"
                  alt="Analyzing..."
                  className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full border-3 sm:border-4 border-[#A53860] animate-pulse shadow-xl ring-2 sm:ring-4 ring-[#EF88AD]/50 object-cover"
                />
                <div className="absolute -bottom-6 sm:-bottom-8 left-1/2 transform -translate-x-1/2 bg-[#3A0519]/90 text-white px-2 py-1 rounded-full text-xs font-bold border border-[#EF88AD]/30 backdrop-blur-sm">
                  analyzing...
                </div>
              </div>
            </div>
          </div>
            </div>
          )}

      {/* AI Analysis Section - FIXED LAYOUT */}
      {userData && (
        <div className="w-full max-w-4xl mx-auto px-4 mb-8">
          <div className="bg-white border-2 border-[#A53860] rounded-xl p-6 sm:p-8 shadow-lg">
            {/* Title */}
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#A53860] mb-6 sm:mb-8 text-center">
              AI Analysis of @{userData.username}
            </h2>
            
            {/* Final Verdict - Centered and Prominent */}
            <div className="text-center mb-8 sm:mb-10">
              <div className="inline-block bg-[#EF88AD] border-2 border-[#670D2F] rounded-xl px-6 sm:px-8 py-4 sm:py-5 shadow-md">
                <p className="text-xs sm:text-sm text-[#670D2F] font-bold mb-1 sm:mb-2">FINAL VERDICT</p>
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-black">
                  {userData.quadrant?.toUpperCase().replace('-', ' ')}
                </p>
              </div>
            </div>
            
            {/* Behavior Analysis - FIXED GRID LAYOUT */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-10">
              {/* Desperate */}
              <div className="bg-pink-50 border-2 border-pink-200 rounded-xl p-4 sm:p-5 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="text-xs sm:text-sm font-bold text-pink-600 mb-2 sm:mb-3 uppercase tracking-wide">Desperate</div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-pink-700 mb-2 sm:mb-3">{userData.percentages.desperate}%</div>
                <div className="text-sm text-pink-600 font-medium mb-4">
                  {userData.percentages.desperate >= 70 ? 'Very High' : 
                   userData.percentages.desperate >= 50 ? 'High' : 
                   userData.percentages.desperate >= 30 ? 'Moderate' : 'Low'}
                </div>
                <div className="w-full bg-pink-200 rounded-full h-3">
                  <div 
                    className="bg-pink-500 h-3 rounded-full transition-all duration-1000" 
                    style={{width: `${userData.percentages.desperate}%`}}
                  ></div>
                </div>
              </div>

              {/* Performative */}
              <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 sm:p-5 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="text-xs sm:text-sm font-bold text-gray-700 mb-2 sm:mb-3 uppercase tracking-wide">Performative</div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-700 mb-2 sm:mb-3">{userData.percentages.performative}%</div>
                <div className="text-sm text-gray-600 font-medium mb-4">
                  {userData.percentages.performative >= 70 ? 'Very High' : 
                   userData.percentages.performative >= 50 ? 'High' : 
                   userData.percentages.performative >= 30 ? 'Moderate' : 'Low'}
                  </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gray-600 h-3 rounded-full transition-all duration-1000" 
                    style={{width: `${userData.percentages.performative}%`}}
                  ></div>
                  </div>
                  </div>

              {/* Cry For Help */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 sm:p-5 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="text-xs sm:text-sm font-bold text-blue-600 mb-2 sm:mb-3 uppercase tracking-wide">Cry For Help</div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-700 mb-2 sm:mb-3">{userData.percentages.cry_for_help}%</div>
                <div className="text-sm text-blue-600 font-medium mb-4">
                  {userData.percentages.cry_for_help >= 70 ? 'Very High' : 
                   userData.percentages.cry_for_help >= 50 ? 'High' : 
                   userData.percentages.cry_for_help >= 30 ? 'Moderate' : 'Low'}
                  </div>
                <div className="w-full bg-blue-200 rounded-full h-3">
                  <div 
                    className="bg-blue-500 h-3 rounded-full transition-all duration-1000" 
                    style={{width: `${userData.percentages.cry_for_help}%`}}
                  ></div>
                </div>
              </div>

              {/* Ragebaiter */}
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 sm:p-5 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="text-xs sm:text-sm font-bold text-green-600 mb-2 sm:mb-3 uppercase tracking-wide">Ragebaiter</div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-700 mb-2 sm:mb-3">{userData.percentages.ragebaiter}%</div>
                <div className="text-sm text-green-600 font-medium mb-4">
                  {userData.percentages.ragebaiter >= 70 ? 'Very High' : 
                   userData.percentages.ragebaiter >= 50 ? 'High' : 
                   userData.percentages.ragebaiter >= 30 ? 'Moderate' : 'Low'}
                </div>
                <div className="w-full bg-green-200 rounded-full h-3">
                  <div 
                    className="bg-green-500 h-3 rounded-full transition-all duration-1000" 
                    style={{width: `${userData.percentages.ragebaiter}%`}}
                  ></div>
                </div>
              </div>
            </div>
            
            {/* Analysis Text - Better Formatted */}
            {/* <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Detailed Analysis</h3>
              <p className="text-base text-gray-700 leading-relaxed font-medium">
                {userData.analysis}
              </p>
            </div> */}
            
            {/* Confidence Score - Bottom Center
            <div className="text-center">
              <div className="inline-block bg-[#EF88AD] border-2 border-[#670D2F] rounded-xl px-10 py-6 shadow-md">
                <p className="text-sm text-[#670D2F] font-bold mb-3 uppercase tracking-wide">AI Confidence</p>
                <p className="text-4xl font-bold text-black">
                  {(userData.confidence * 100).toFixed(0)}%
                </p>
              </div>
            </div> */}
          </div>
        </div>
      )}

      {/* Footer with Credits and Legal Info */}
      <div className="w-full max-w-4xl mx-auto px-4 mb-8">
        <div className="bg-white/80 backdrop-blur-sm border-2 border-[#A53860] rounded-xl p-6 shadow-lg">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-[#A53860] mb-4">How This Analysis Works</h3>
            <p className="text-gray-700 text-sm leading-relaxed mb-4">
              This tool analyzes publicly available Twitter content using AI to assess personality traits across four dimensions: 
              <strong>Desperate</strong> (attention-seeking), <strong>Performative</strong> (authenticity), 
              <strong>Cry for Help</strong> (support-seeking), and <strong>Ragebaiter</strong> (controversy-provoking). 
              Results are based on content patterns and should be taken as entertainment only.
            </p>
          </div>
          
          <div className="border-t border-[#A53860]/30 pt-6">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600 mb-2">Made with 🍍 by</p>
              <div className="flex justify-center items-center gap-4 text-sm">
                <a 
                  href="https://x.com/combif1am" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#A53860] hover:text-[#670D2F] font-bold transition-colors"
                >
                  @combif1am
                </a>
                <span className="text-gray-400">&</span>
                <a 
                  href="https://x.com/lowkeyverybored" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#A53860] hover:text-[#670D2F] font-bold transition-colors"
                >
                  @lowkeyverybored
                </a>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">  Used Exa AI for gathering data, Groq for AI inference, Vercel for deployment, yayyyy </p>
        </div>



            <div className="text-center">
              <p className="text-xs text-gray-500 leading-relaxed"> <strong>Disclaimer:</strong> This tool is for entertainment and educational purposes only. All analysis results are AI-generated interpretations based on publicly available content and should not be considered as professional psychological assessment, medical advice, or factual personality evaluation. We do not store, collect, or retain personal data. Analysis is performed using legitimate third-party API services on publicly accessible content only. Results may not accurately reflect actual personality traits or behaviors. By using this tool, you acknowledge that you are doing so at your own discretion and risk. Use responsibly, respect others&apos; privacy, and do not use this tool to harass, discriminate against, or make important decisions about individuals. </p> 
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}