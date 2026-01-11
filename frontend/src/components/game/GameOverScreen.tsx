/**
 * Game Over Screen Component
 * 
 * Displays the end game results with:
 * - Winner celebration with crown
 * - Final scoreboard with medals
 * - Game stats
 * - Play Again / Home buttons
 * - Share score functionality
 */

import { useEffect, useState } from 'react';
import { soundService } from '../../services/soundService';

// =============================================================================
// TYPES
// =============================================================================

interface GameOverScreenProps {
  winner: {
    playerId: string;
    name: string;
    score: number;
  } | null;
  finalScores: Array<{
    playerId: string;
    name: string;
    score: number;
    isEliminated?: boolean;
  }>;
  currentPlayerId: string;
  roundsPlayed: number;
  onPlayAgain: () => void;
  onGoHome: () => void;
  gameCode: string;
}

// =============================================================================
// CONFETTI COMPONENT
// =============================================================================

const Confetti: React.FC = () => {
  const colors = ['#ff4136', '#ffdc00', '#2ecc40', '#0074d9', '#ff6b6b', '#ffd93d'];
  const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 3,
    duration: 2 + Math.random() * 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * 360,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {confettiPieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute w-3 h-3 animate-fall"
          style={{
            left: `${piece.left}%`,
            top: '-20px',
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            transform: `rotate(${piece.rotation}deg)`,
            borderRadius: Math.random() > 0.5 ? '50%' : '0',
          }}
        />
      ))}
    </div>
  );
};

// =============================================================================
// GAME OVER SCREEN COMPONENT
// =============================================================================

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  winner,
  finalScores,
  currentPlayerId,
  roundsPlayed,
  onPlayAgain,
  onGoHome,
  gameCode,
}) => {
  const [showConfetti, setShowConfetti] = useState(true);
  const [animatedScore, setAnimatedScore] = useState(0);
  const isWinner = winner?.playerId === currentPlayerId;
  const isSoloGame = finalScores.length === 1;

  // Animate score count-up
  useEffect(() => {
    if (!winner) return;
    
    const targetScore = winner.score;
    const duration = 1500; // 1.5 seconds
    const steps = 30;
    const increment = targetScore / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= targetScore) {
        setAnimatedScore(targetScore);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [winner]);

  // Play victory sound on mount
  useEffect(() => {
    soundService.playVictory();
    
    // Hide confetti after 5 seconds
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  // Get medal emoji based on rank
  const getMedal = (rank: number): string => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `${rank}.`;
    }
  };

  // Share score functionality
  const handleShare = async () => {
    const myScore = finalScores.find(s => s.playerId === currentPlayerId)?.score || 0;
    const rank = finalScores.findIndex(s => s.playerId === currentPlayerId) + 1;
    
    const shareText = isSoloGame
      ? `🎮 I reached Round ${roundsPlayed} in Michal Says with ${myScore} points! Can you beat my score?`
      : `🏆 I finished #${rank} in Michal Says with ${myScore} points! ${isWinner ? '👑 WINNER!' : ''}`;
    
    const shareUrl = `${window.location.origin}/?join=${gameCode}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Michal Says Score',
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or error - fallback to copy
        if ((err as Error).name !== 'AbortError') {
          copyToClipboard(shareText + '\n' + shareUrl);
        }
      }
    } else {
      copyToClipboard(shareText + '\n' + shareUrl);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Could add toast notification here
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #ec4899 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Confetti */}
      {showConfetti && <Confetti />}
      
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
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: '28rem'
      }}>
        {/* Game Over Title */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{
            fontSize: 'clamp(2rem, 8vw, 2.5rem)',
            fontWeight: 900,
            color: 'white',
            marginBottom: '0.5rem',
            textShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
          }}>
            🎉 GAME OVER 🎉
          </h1>
        </div>

        {/* Winner Section */}
        {winner && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(249, 115, 22, 0.2))',
            border: '2px solid #fbbf24',
            borderRadius: '1.5rem',
            padding: '1.5rem',
            marginBottom: '1rem',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 0 30px rgba(251, 191, 36, 0.3)'
          }}>
            {/* Crown animation */}
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem', animation: 'bounce 1s ease-in-out infinite' }}>👑</div>
            
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#fbbf24',
              marginBottom: '0.5rem'
            }}>
              {isSoloGame ? 'GREAT JOB!' : 'WINNER!'}
            </h2>
            
            <div style={{
              color: 'white',
              fontSize: '1.25rem',
              fontWeight: 600,
              marginBottom: '0.25rem'
            }}>
              {winner.name}
            </div>
            
            <div style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              color: '#fde68a'
            }}>
              {animatedScore} <span style={{ fontSize: '1rem' }}>points</span>
            </div>
            
            {isWinner && !isSoloGame && (
              <div style={{
                marginTop: '0.5rem',
                color: '#4ade80',
                fontSize: '0.875rem',
                fontWeight: 600
              }}>
                ✨ That's YOU! ✨
              </div>
            )}
          </div>
        )}

        {/* Scoreboard (Multiplayer only) */}
        {!isSoloGame && finalScores.length > 0 && (
          <div style={{
            background: 'rgba(31, 41, 55, 0.8)',
            borderRadius: '1.5rem',
            padding: '1rem',
            marginBottom: '1rem',
            backdropFilter: 'blur(10px)'
          }}>
            <h3 style={{
              color: 'white',
              fontWeight: 700,
              textAlign: 'center',
              marginBottom: '0.75rem',
              fontSize: '0.875rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Final Standings
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {finalScores.map((player, index) => {
                const isCurrentPlayer = player.playerId === currentPlayerId;
                const rank = index + 1;
                
                return (
                  <div
                    key={player.playerId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '0.75rem',
                      background: isCurrentPlayer ? '#2563eb' : 'rgba(55, 65, 81, 0.8)',
                      transform: isCurrentPlayer ? 'scale(1.02)' : 'scale(1)',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '1.25rem', width: '2rem', textAlign: 'center' }}>
                        {getMedal(rank)}
                      </span>
                      <span style={{ color: 'white', fontWeight: 500 }}>
                        {player.name}
                        {isCurrentPlayer && <span style={{ fontSize: '0.75rem', marginLeft: '0.25rem', color: '#bfdbfe' }}>(you)</span>}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: 'white', fontWeight: 700 }}>
                        {player.score} pts
                      </span>
                      {player.isEliminated && (
                        <span style={{ color: '#f87171', fontSize: '0.75rem' }}>💀</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Game Stats */}
        <div style={{
          background: 'rgba(31, 41, 55, 0.6)',
          borderRadius: '1rem',
          padding: '1rem',
          marginBottom: '1.5rem',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            textAlign: 'center'
          }}>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>{roundsPlayed}</div>
              <div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>Rounds</div>
            </div>
            <div style={{ borderLeft: '1px solid #4b5563' }} />
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>
                {finalScores.find(s => s.playerId === currentPlayerId)?.score || 0}
              </div>
              <div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>Your Score</div>
            </div>
            {!isSoloGame && (
              <>
                <div style={{ borderLeft: '1px solid #4b5563' }} />
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>
                    #{finalScores.findIndex(s => s.playerId === currentPlayerId) + 1}
                  </div>
                  <div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>Your Rank</div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {/* Play Again Button */}
          <button
            onClick={onPlayAgain}
            style={{
              width: '100%',
              background: 'linear-gradient(to right, #22c55e, #16a34a)',
              color: 'white',
              fontWeight: 700,
              padding: '1rem 1.5rem',
              borderRadius: '1rem',
              border: 'none',
              fontSize: '1.125rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 10px 15px -3px rgba(34, 197, 94, 0.4)',
              transition: 'all 0.2s',
              touchAction: 'manipulation'
            }}
          >
            🔄 PLAY AGAIN
          </button>

          {/* Home Button */}
          <button
            onClick={onGoHome}
            style={{
              width: '100%',
              background: 'rgba(55, 65, 81, 0.8)',
              color: 'white',
              fontWeight: 700,
              padding: '1rem 1.5rem',
              borderRadius: '1rem',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              fontSize: '1.125rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s',
              touchAction: 'manipulation'
            }}
          >
            🏠 HOME
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            style={{
              width: '100%',
              background: 'linear-gradient(to right, #2563eb, #3b82f6)',
              color: 'white',
              fontWeight: 700,
              padding: '0.875rem 1.5rem',
              borderRadius: '1rem',
              border: 'none',
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.4)',
              transition: 'all 0.2s',
              touchAction: 'manipulation'
            }}
          >
            📤 SHARE SCORE
          </button>
        </div>
      </div>

      {/* CSS for confetti animation */}
      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-fall {
          animation: fall linear infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.4; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
};

export default GameOverScreen;
