import { useState, useEffect } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
  duration?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ 
  onComplete
}) => {
  const [isFading, setIsFading] = useState(false);

  const handleDismiss = () => {
    if (isFading) return; // Prevent double-trigger
    setIsFading(true);
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  const handleClick = () => {
    handleDismiss();
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
      handleDismiss();
    }
  };

  // Auto-dismiss after 10 seconds as fallback
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isFading) {
        setIsFading(true);
        setTimeout(() => {
          onComplete();
        }, 300);
      }
    }, 10000);

    // Add keyboard listener
    window.addEventListener('keydown', handleKeyPress);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [isFading, onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 cursor-pointer ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      onClick={handleClick}
      style={{ touchAction: 'manipulation' }}
    >
      {/* Modern dark gradient background matching welcome screen */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900"></div>
      
      {/* Animated background circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full p-4">
        {/* Animated Color Circles */}
        <div className="flex justify-center gap-4 mb-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow-2xl animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-2xl animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-2xl animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-2xl animate-bounce" style={{ animationDelay: '0.6s' }}></div>
        </div>
        
        {/* Modern circular game board icon */}
        <div className="mb-8 relative">
          <div className="relative w-48 h-48 sm:w-64 sm:h-64">
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full border-8 border-white/30"></div>
            {/* Color quadrants */}
            <div className="absolute inset-2 rounded-full overflow-hidden">
              <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-pink-500 to-pink-600"></div>
              <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-blue-500 to-blue-600"></div>
              <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-yellow-500 to-yellow-600"></div>
              <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-green-500 to-green-600"></div>
            </div>
            {/* Center circle */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 sm:w-24 sm:h-24 bg-gray-900 rounded-full border-4 border-white/50 flex items-center justify-center">
              <span className="text-white font-bold text-xl sm:text-2xl">M</span>
            </div>
          </div>
        </div>
        
        <h1 className="text-6xl sm:text-7xl md:text-8xl font-black mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent drop-shadow-2xl">
          MICHAL SAYS
        </h1>
        
        <p className="text-white/90 text-xl sm:text-2xl font-semibold mb-2">Memory Challenge</p>
        
        {/* Click to continue hint */}
        <div className="mt-12 animate-pulse">
          <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 border border-white/30">
            <p className="text-white text-sm sm:text-base font-medium flex items-center gap-2">
              <span>👆</span>
              <span>Tap anywhere to continue</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
