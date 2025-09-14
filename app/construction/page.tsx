'use client';

import { useEffect, useState } from 'react';

export default function ConstructionPage() {
  const [dots, setDots] = useState('');

  // Animated dots for "working" text
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#EF88AD] text-black flex items-center justify-center p-6 font-comic">
      <div className="max-w-2xl mx-auto text-center">
        {/* Main Logo */}
        <div className="mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold mb-4">
            <span className="text-white">oomf-</span>
            <span className="text-white">analyzer</span>
          </h1>
          <p className="text-[#670D2F] text-lg sm:text-xl font-medium">
            discover your twitter personality type
          </p>
        </div>

        {/* Construction Notice */}
        <div className="bg-white border-4 border-[#670D2F] rounded-2xl p-8 sm:p-12 shadow-2xl mb-8">
          <div className="mb-6">
            <div className="text-6xl sm:text-8xl mb-4">🚧</div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#A53860] mb-4">
              Site Under Construction
            </h2>
          </div>
          
          <div className="space-y-4 sm:space-y-6 text-[#670D2F]">
            <p className="text-lg sm:text-xl font-bold">
              We're temporarily shut down due to too many requests
            </p>
            
            <div className="bg-[#EF88AD] border-2 border-[#670D2F] rounded-xl p-6 mx-auto max-w-md">
              <p className="text-base sm:text-lg font-medium mb-2">
                Working promptly to get back up{dots}
              </p>
              <p className="text-sm font-medium">
                Please wait while we handle the traffic surge
              </p>
            </div>
            
            <p className="text-base font-medium">
              Thank you for your patience! ❤️
            </p>
          </div>
        </div>

        {/* Status Updates */}
        {/* <div className="bg-white/80 backdrop-blur-sm border-2 border-[#A53860] rounded-xl p-6 shadow-lg">
          <h3 className="text-lg sm:text-xl font-bold text-[#A53860] mb-4">
            What's Happening?
          </h3>
          <div className="space-y-3 text-[#670D2F] text-sm sm:text-base">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Scaling up servers</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              <span>Optimizing performance</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Adding rate limiting</span>
            </div>
          </div>
        </div> */}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-[#670D2F] text-sm font-medium mb-2">
            Made with 🍍 by
          </p>
          <div className="flex justify-center items-center gap-4 text-sm">
            <a 
              href="https://x.com/combif1am" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#A53860] hover:text-[#670D2F] font-bold transition-colors"
            >
              @combif1am
            </a>
            <span className="text-[#670D2F]">&</span>
            <a 
              href="https://x.com/lowkeyverybored" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#A53860] hover:text-[#670D2F] font-bold transition-colors"
            >
              @lowkeyverybored
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
