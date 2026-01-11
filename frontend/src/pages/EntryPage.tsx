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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #ec4899 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem 1.5rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
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
      </div>
      
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        borderRadius: '1.5rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        padding: '2rem 2.5rem',
        maxWidth: '28rem',
        width: '100%',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        position: 'relative',
        zIndex: 10
      }}>
        <button
          onClick={() => setMode(null)}
          style={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: 'clamp(0.875rem, 2vw, 1rem)',
            fontWeight: 500,
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'color 0.2s',
            background: 'none',
            border: 'none',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 1)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'}
        >
          <span>←</span> Back
        </button>
        
        <h2 style={{
          fontSize: 'clamp(1.5rem, 5vw, 1.875rem)',
          fontWeight: 700,
          marginBottom: '2rem',
          background: 'linear-gradient(to right, #ffffff, #e9d5ff, #fce7f3)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          {mode === 'create' ? 'Create Game' : 'Join Game'}
        </h2>
        
        <form onSubmit={mode === 'create' ? handleCreateGame : handleJoinGame} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.9)',
              marginBottom: '0.5rem'
            }}>
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
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '0.75rem',
                fontSize: '1rem',
                transition: 'all 0.2s',
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 0.8)';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(147, 51, 234, 0.2)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>
          
          {mode === 'join' && (
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'rgba(255, 255, 255, 0.9)',
                marginBottom: '0.5rem'
              }}>
                Game Code
                {searchParams.get('join') && (
                  <span style={{
                    marginLeft: '0.5rem',
                    fontSize: '0.75rem',
                    color: 'rgba(34, 197, 94, 1)',
                    fontWeight: 500,
                    background: 'rgba(34, 197, 94, 0.2)',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.375rem'
                  }}>
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
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '0.75rem',
                  fontSize: '1rem',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textAlign: 'center',
                  textTransform: 'uppercase',
                  transition: 'all 0.2s',
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 0.8)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(147, 51, 234, 0.2)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>
          )}
          
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.9)',
              marginBottom: '0.75rem'
            }}>
              Choose Avatar
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
              {['1', '2', '3', '4'].map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setAvatarId(id)}
                  style={{
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    border: avatarId === id ? '2px solid rgba(147, 51, 234, 0.8)' : '2px solid rgba(255, 255, 255, 0.3)',
                    transition: 'all 0.2s',
                    minHeight: '64px',
                    minWidth: '64px',
                    background: avatarId === id 
                      ? 'rgba(147, 51, 234, 0.3)' 
                      : 'rgba(255, 255, 255, 0.1)',
                    transform: avatarId === id ? 'scale(1.05)' : 'scale(1)',
                    boxShadow: avatarId === id ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none',
                    touchAction: 'manipulation',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    if (avatarId !== id) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                      e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 0.5)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (avatarId !== id) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                    }
                  }}
                >
                  <span style={{ fontSize: '1.875rem' }}>{['😀', '🎮', '🚀', '⚡'][parseInt(id) - 1]}</span>
                </button>
              ))}
            </div>
          </div>
          
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: '2px solid rgba(239, 68, 68, 0.5)',
              color: 'rgba(255, 255, 255, 0.95)',
              padding: '0.75rem 1rem',
              borderRadius: '0.75rem',
              fontSize: '0.875rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>⚠️</span>
                <span>{error}</span>
              </div>
              {error.includes('Room not found') && (
                <div style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '0.75rem',
                  marginTop: '0.5rem',
                  paddingTop: '0.5rem',
                  borderTop: '1px solid rgba(239, 68, 68, 0.3)'
                }}>
                  💡 Tip: Make sure the host is still in the waiting room and hasn't closed the game.
                </div>
              )}
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: loading 
                ? 'linear-gradient(to right, #9ca3af, #6b7280)' 
                : 'linear-gradient(to right, #9333ea, #a855f7, #ec4899)',
              color: 'white',
              fontWeight: 600,
              padding: '1rem 1.5rem',
              borderRadius: '0.75rem',
              border: 'none',
              boxShadow: loading 
                ? 'none' 
                : '0 10px 15px -3px rgba(147, 51, 234, 0.5)',
              transition: 'all 0.2s',
              fontSize: '1.125rem',
              minHeight: '56px',
              touchAction: 'manipulation',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(147, 51, 234, 0.6)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(147, 51, 234, 0.5)';
              }
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>
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
