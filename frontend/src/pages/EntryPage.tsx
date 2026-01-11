/**
 * Entry Page
 * 
 * Name + avatar selection page.
 * First screen players see.
 */

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createSession, joinGame } from '../services/authService';
import { useAuthStore } from '../store/authStore';

export function EntryPage() {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<'create' | 'join' | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [gameCode, setGameCode] = useState('');
  const [avatarId, setAvatarId] = useState('1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { setSession } = useAuthStore();
  const navigate = useNavigate();
  
  // Handle invite link with game code in URL
  useEffect(() => {
    const joinCode = searchParams.get('join');
    if (joinCode) {
      setMode('join');
      setGameCode(joinCode.toUpperCase());
    }
  }, [searchParams]);

  // Debug: Log when component renders
  useEffect(() => {
    console.log('🎮 EntryPage rendered, mode:', mode);
  }, [mode]);

  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await createSession(displayName, avatarId);
      setSession(response.session);
      navigate('/waiting');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create game');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGame = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await joinGame(displayName, avatarId, gameCode);
      setSession(response.session);
      navigate('/waiting');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to join game';
      
      // Provide helpful error messages
      if (errorMessage.includes('Room not found') || errorMessage.includes('room not found')) {
        setError(
          'Room not found. The game may have ended or the server restarted. ' +
          'Ask the host to create a new game and share a fresh game code.'
        );
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!mode) {
    return (
      <div 
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #ec4899 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
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

        <div style={{
          position: 'relative',
          zIndex: 10,
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          borderRadius: '1.5rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          padding: '2rem',
          maxWidth: '32rem',
          width: '100%',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          {/* Logo/Title Section */}
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            {/* Animated Color Circles */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
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
            
            <h1 style={{
              fontSize: 'clamp(2.5rem, 8vw, 4.5rem)',
              fontWeight: 900,
              marginBottom: '1rem',
              background: 'linear-gradient(to right, #ffffff, #e9d5ff, #fce7f3)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              MICHAL SAYS
            </h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Memory Challenge
            </p>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '1rem' }}>
              Test your memory with friends!
            </p>
          </div>
          
          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button
              onClick={() => setMode('create')}
              style={{
                width: '100%',
                background: 'linear-gradient(to right, #9333ea, #a855f7, #ec4899)',
                color: 'white',
                fontWeight: 'bold',
                padding: '1.25rem 2rem',
                borderRadius: '1rem',
                border: 'none',
                fontSize: '1.125rem',
                minHeight: '64px',
                cursor: 'pointer',
                boxShadow: '0 20px 25px -5px rgba(147, 51, 234, 0.5)',
                transition: 'all 0.3s',
                touchAction: 'manipulation'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(147, 51, 234, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(147, 51, 234, 0.5)';
              }}
            >
              ✨ Create New Game
            </button>
            
            <button
              onClick={() => setMode('join')}
              style={{
                width: '100%',
                background: 'linear-gradient(to right, #2563eb, #3b82f6, #06b6d4)',
                color: 'white',
                fontWeight: 'bold',
                padding: '1.25rem 2rem',
                borderRadius: '1rem',
                border: 'none',
                fontSize: '1.125rem',
                minHeight: '64px',
                cursor: 'pointer',
                boxShadow: '0 20px 25px -5px rgba(37, 99, 235, 0.5)',
                transition: 'all 0.3s',
                touchAction: 'manipulation'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(37, 99, 235, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(37, 99, 235, 0.5)';
              }}
            >
              🎯 Join Game
            </button>
          </div>

          {/* Features */}
          <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>👥</div>
                <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.75rem', fontWeight: 500 }}>Up to 4 Players</div>
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>⚡</div>
                <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.75rem', fontWeight: 500 }}>Real-time</div>
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>🏆</div>
                <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.75rem', fontWeight: 500 }}>Compete</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-blue-600 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 sm:p-10 max-w-md w-full border border-white/20">
        <button
          onClick={() => setMode(null)}
          className="text-gray-600 hover:text-gray-800 active:text-gray-900 mb-6 text-sm sm:text-base font-medium flex items-center gap-2 transition-colors"
        >
          <span>←</span> Back
        </button>
        
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-gray-900">
          {mode === 'create' ? 'Create Game' : 'Join Game'}
        </h2>
        
        <form onSubmit={mode === 'create' ? handleCreateGame : handleJoinGame} className="space-y-5 sm:space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your name"
              minLength={3}
              maxLength={12}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-base transition-all duration-200 bg-white"
            />
          </div>
          
          {mode === 'join' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Game Code
                {searchParams.get('join') && (
                  <span className="ml-2 text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-md">
                    ✅ Pre-filled
                  </span>
                )}
              </label>
              <input
                type="text"
                value={gameCode}
                onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                placeholder="ABCDEF"
                maxLength={6}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 uppercase text-base font-semibold tracking-wider text-center transition-all duration-200 bg-white"
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Choose Avatar
            </label>
            <div className="grid grid-cols-4 gap-3">
              {['1', '2', '3', '4'].map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setAvatarId(id)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 active:scale-95 min-h-[64px] min-w-[64px] ${
                    avatarId === id
                      ? 'border-purple-600 bg-purple-50 shadow-md scale-105'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 active:border-gray-300 bg-white'
                  }`}
                  style={{ touchAction: 'manipulation' }}
                >
                  <span className="text-3xl">{['😀', '🎮', '🚀', '⚡'][parseInt(id) - 1]}</span>
                </button>
              ))}
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-800 px-4 py-3 rounded-xl text-sm space-y-2">
              <div className="font-semibold flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
              {error.includes('Room not found') && (
                <div className="text-red-600 text-xs mt-2 pt-2 border-t border-red-200">
                  💡 Tip: Make sure the host is still in the waiting room and hasn't closed the game.
                </div>
              )}
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl disabled:shadow-none transform hover:-translate-y-0.5 active:translate-y-0 disabled:transform-none transition-all duration-200 text-lg min-h-[56px]"
            style={{ touchAction: 'manipulation' }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span>
                <span>Loading...</span>
              </span>
            ) : (
              mode === 'create' ? 'Create Game' : 'Join Game'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
