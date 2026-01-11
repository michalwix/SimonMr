/**
 * Intro Screen
 * 
 * First screen that appears - just shows "MICHAL SAYS"
 * Click to continue to welcome screen
 */

import { useState, useEffect } from 'react';

interface IntroScreenProps {
  onComplete: () => void;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({ onComplete }) => {
  const [isFading, setIsFading] = useState(false);

  const handleDismiss = () => {
    if (isFading) return;
    setIsFading(true);
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
      handleDismiss();
    }
  };

  // Auto-dismiss after 5 seconds as fallback
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isFading) {
        handleDismiss();
      }
    }, 5000);

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [isFading]);

  return (
    <div
      onClick={handleDismiss}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        opacity: isFading ? 0 : 1,
        transition: 'opacity 0.3s ease-out',
        pointerEvents: isFading ? 'none' : 'auto',
        touchAction: 'manipulation'
      }}
    >
      {/* Dark gradient background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #ec4899 100%)'
      }}></div>
      
      {/* Animated background circles */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          top: '5rem',
          left: '2.5rem',
          width: '18rem',
          height: '18rem',
          background: 'rgba(168, 85, 247, 0.2)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          animation: 'pulse 2s ease-in-out infinite'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '5rem',
          right: '2.5rem',
          width: '24rem',
          height: '24rem',
          background: 'rgba(236, 72, 153, 0.2)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          animation: 'pulse 2s ease-in-out infinite',
          animationDelay: '1s'
        }}></div>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '20rem',
          height: '20rem',
          background: 'rgba(59, 130, 246, 0.2)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          animation: 'pulse 2s ease-in-out infinite',
          animationDelay: '0.5s'
        }}></div>
      </div>

      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        textAlign: 'center',
        padding: '2rem'
      }}>
        {/* Animated Color Circles */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '0.75rem', 
          marginBottom: '2rem' 
        }}>
          <div style={{
            width: '3rem',
            height: '3rem',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #f87171, #dc2626)',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            animation: 'bounce 1s ease-in-out infinite',
            animationDelay: '0s'
          }}></div>
          <div style={{
            width: '3rem',
            height: '3rem',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #60a5fa, #2563eb)',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            animation: 'bounce 1s ease-in-out infinite',
            animationDelay: '0.2s'
          }}></div>
          <div style={{
            width: '3rem',
            height: '3rem',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #fbbf24, #d97706)',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            animation: 'bounce 1s ease-in-out infinite',
            animationDelay: '0.4s'
          }}></div>
          <div style={{
            width: '3rem',
            height: '3rem',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #34d399, #059669)',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            animation: 'bounce 1s ease-in-out infinite',
            animationDelay: '0.6s'
          }}></div>
        </div>
        
        {/* MICHAL SAYS Title */}
        <h1 style={{
          fontSize: 'clamp(3rem, 12vw, 6rem)',
          fontWeight: 900,
          marginBottom: '1rem',
          background: 'linear-gradient(to right, #ffffff, #e9d5ff, #fce7f3)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          letterSpacing: '0.05em'
        }}>
          MICHAL SAYS
        </h1>
        
        {/* Tap to continue hint */}
        <div style={{ marginTop: '3rem', animation: 'pulse 2s ease-in-out infinite' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            borderRadius: '9999px',
            padding: '0.75rem 1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            display: 'inline-block'
          }}>
            <p style={{
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: 500,
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              justifyContent: 'center'
            }}>
              <span>👆</span>
              <span>Tap anywhere to continue</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
