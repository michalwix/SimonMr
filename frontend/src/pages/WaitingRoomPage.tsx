/**
 * Waiting Room / Game Page
 * 
 * Combined page that shows:
 * - Waiting room before game starts
 * - Simon game board during gameplay
 */

import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useSimonStore } from '../store/simonStore';
import { socketService } from '../services/socketService';
import { soundService } from '../services/soundService';
import { CircularSimonBoard } from '../components/game/CircularSimonBoard';
import { GameOverScreen } from '../components/game/GameOverScreen';
import { Toast } from '../components/ui/Toast';
import { MuteButton } from '../components/ui/MuteButton';

export function WaitingRoomPage() {
  const navigate = useNavigate();
  const { session, clearSession } = useAuthStore();
  const gameCode = session?.gameCode;
  const playerId = session?.playerId;
  
  const { 
    isGameActive, 
    currentSequence, 
    currentRound, 
    isShowingSequence,
    isInputPhase,
    playerSequence,
    canSubmit,
    lastResult,
    message,
    secondsRemaining,
    timerColor,
    isTimerPulsing,
    isEliminated,
    scores,
    submittedPlayers,
    isGameOver,
    gameWinner,
    finalScores,
    initializeListeners,
    cleanup,
    addColorToSequence,
    resetGame,
  } = useSimonStore();
  
  const [roomStatus, setRoomStatus] = useState<'waiting' | 'countdown' | 'active'>('waiting');
  const [countdownValue, setCountdownValue] = useState<number | null>(null);
  const [isHost, setIsHost] = useState(session?.isHost || false);
  const [players, setPlayers] = useState<any[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const lastCountdownValue = useRef<number | null>(null);
  
  // Initialize on mount
  useEffect(() => {
    console.log('🎮 WaitingRoomPage mounted');
    
    // CRITICAL FIX: Connect socket FIRST, then initialize listeners
    const socket = socketService.connect();
    console.log('✅ Socket connected:', socket.connected);
    
    // Initialize Simon listeners AFTER socket is connected
    initializeListeners();
    
    // Join room via socket
    if (gameCode && playerId) {
      socket.emit('join_room_socket', { gameCode, playerId });
    }
    
    // Listen for initial room state (ONCE to avoid race condition)
    socket.once('room_state', (room: any) => {
      console.log('📦 Initial room state:', room);
      setPlayers(room.players || []);
      setRoomStatus(room.status);
      
      // Check if we're the host
      const me = room.players?.find((p: any) => p.id === playerId);
      const isHostPlayer = me?.isHost || false;
      console.log('🎮 isHost check:', { playerId, me, isHostPlayer });
      setIsHost(isHostPlayer);
    });
    
    // Listen for room state updates (when players join/leave)
    socket.on('room_state_update', (room: any) => {
      console.log('🔄 Room state updated:', room);
      setPlayers(room.players || []);
      setRoomStatus(room.status);
      
      // Check if we're the host
      const me = room.players?.find((p: any) => p.id === playerId);
      setIsHost(me?.isHost || false);
    });
    
    // Listen for errors
    socket.on('error', (data: { message: string }) => {
      console.error('❌ Server error:', data.message);
      setToast({ message: data.message, type: 'error' });
    });
    
    // Listen for countdown
    socket.on('countdown', (data: { count: number }) => {
      console.log('⏳ Countdown:', data.count);
      setRoomStatus('countdown');
      setCountdownValue(data.count);
      
      // 🔊 Play countdown beep (only once per second)
      if (lastCountdownValue.current !== data.count) {
        soundService.playCountdown(data.count);
        lastCountdownValue.current = data.count;
      }
      
      if (data.count === 0) {
        setRoomStatus('active');
        setCountdownValue(null);
        lastCountdownValue.current = null;
      }
    });
    
    // Listen for player joined (for real-time feedback)
    socket.on('player_joined', (player: any) => {
      console.log('👋 Player joined:', player);
      // Don't modify state here - wait for room_state_update
    });
    
    // Listen for player left
    socket.on('player_left', (data: { playerId: string }) => {
      console.log('👋 Player left:', data.playerId);
      setPlayers(prev => prev.filter(p => p.id !== data.playerId));
    });
    
    // Listen for game restarted (Play Again)
    socket.on('game_restarted', (data: { gameCode: string }) => {
      console.log('🔄 Game restarted:', data.gameCode);
      // Reset local state to waiting room
      resetGame();
      setRoomStatus('waiting');
      lastCountdownValue.current = null;
    });
    
    // Cleanup on unmount
    return () => {
      cleanup();
      socket.off('room_state');
      socket.off('room_state_update');
      socket.off('error');
      socket.off('countdown');
      socket.off('player_joined');
      socket.off('player_left');
      socket.off('game_restarted');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameCode, playerId]); // Removed initializeListeners & cleanup - they're stable
  
  // Handle start game (host only)
  const handleStartGame = async () => {
    console.log('🎮 DEBUG: handleStartGame called');
    console.log('🎮 DEBUG: gameCode:', gameCode);
    console.log('🎮 DEBUG: playerId:', playerId);
    console.log('🎮 DEBUG: isHost:', isHost);
    
    // 🔊 Initialize sound on user interaction
    await soundService.init();
    
    const socket = socketService.getSocket();
    console.log('🎮 DEBUG: socket exists:', !!socket);
    console.log('🎮 DEBUG: socket connected:', socket?.connected);
    
    if (!socket) {
      console.error('❌ No socket connection');
      setToast({ message: 'No connection to server', type: 'error' });
      return;
    }
    
    if (!gameCode || !playerId) {
      console.error('❌ Missing gameCode or playerId');
      setToast({ message: 'Missing game info', type: 'error' });
      return;
    }
    
    console.log('📤 Emitting start_game:', { gameCode, playerId });
    socket.emit('start_game', { gameCode, playerId });
  };
  
  // Copy game code to clipboard
  const copyGameCode = async () => {
    if (!gameCode) return;
    
    try {
      await navigator.clipboard.writeText(gameCode);
      setToast({ message: 'Game code copied!', type: 'success' });
    } catch (err) {
      setToast({ message: 'Failed to copy code', type: 'error' });
    }
  };
  
  // Copy invite link to clipboard
  const copyInviteLink = async () => {
    if (!gameCode) return;
    
    const inviteUrl = `${window.location.origin}/?join=${gameCode}`;
    
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setToast({ message: 'Invite link copied!', type: 'success' });
    } catch (err) {
      setToast({ message: 'Failed to copy link', type: 'error' });
    }
  };
  
  // Handle Play Again
  const handlePlayAgain = () => {
    // Reset local game state
    resetGame();
    setRoomStatus('waiting');
    
    // Emit restart_game to reset room on server
    const socket = socketService.getSocket();
    if (socket && gameCode && playerId) {
      console.log('🔄 Restarting game:', { gameCode, playerId });
      socket.emit('restart_game', { gameCode, playerId });
    }
  };

  // Handle Go Home
  const handleGoHome = () => {
    cleanup();
    clearSession();
    navigate('/');
  };

  // Share game using native share API (mobile-friendly)
  const shareGame = async () => {
    if (!gameCode) return;
    
    const inviteUrl = `${window.location.origin}/?join=${gameCode}`;
    
    // Check if native share is supported
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my Simon Game!',
          text: `Join me in Michal Says! Use code: ${gameCode}`,
          url: inviteUrl,
        });
        setToast({ message: 'Invite shared!', type: 'success' });
      } catch (err) {
        // User cancelled or error - fallback to copy
        if ((err as Error).name !== 'AbortError') {
          copyInviteLink();
        }
      }
    } else {
      // Fallback to copy for desktop
      copyInviteLink();
    }
  };
  
  // Render Game Over screen
  if (isGameOver) {
    return (
      <>
        <MuteButton />
        <GameOverScreen
          winner={gameWinner}
          finalScores={finalScores}
          currentPlayerId={playerId || ''}
          roundsPlayed={currentRound}
          onPlayAgain={handlePlayAgain}
          onGoHome={handleGoHome}
          gameCode={gameCode || ''}
        />
      </>
    );
  }

  // Render game board if active
  if (roomStatus === 'active' && isGameActive) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #ec4899 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.5rem 1rem',
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
        
        {/* Mute Button */}
        <MuteButton />
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          maxWidth: '28rem',
          position: 'relative',
          zIndex: 10
        }}>
          {/* Step 4: Scoreboard */}
          {isGameActive && Object.keys(scores).length > 0 && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              borderRadius: '1rem',
              padding: '1rem',
              marginBottom: '1rem',
              width: '100%',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}>
              <h3 className="text-white font-semibold text-sm uppercase tracking-wide mb-3 text-center">
                Leaderboard
              </h3>
              <div className="space-y-2">
                {players
                  .sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0))
                  .map((player, index) => {
                    const score = scores[player.id] || 0;
                    const hasSubmitted = submittedPlayers.includes(player.id);
                    const isCurrentPlayer = player.id === playerId;
                    const rank = index + 1;
                    
                    return (
                      <div
                        key={player.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.75rem 1rem',
                          borderRadius: '0.75rem',
                          transition: 'all 0.2s',
                          background: isCurrentPlayer 
                            ? 'linear-gradient(to right, #2563eb, #3b82f6, #06b6d4)' 
                            : 'rgba(255, 255, 255, 0.1)',
                          border: isCurrentPlayer 
                            ? '2px solid rgba(59, 130, 246, 0.5)' 
                            : '1px solid rgba(255, 255, 255, 0.2)',
                          transform: isCurrentPlayer ? 'scale(1.05)' : 'scale(1)',
                          boxShadow: isCurrentPlayer ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)' : 'none'
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-gray-400 w-6">
                            {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}.`}
                          </span>
                          <span className="text-2xl">{player.avatar}</span>
                          <span className={`text-white font-medium ${isCurrentPlayer ? 'text-base' : 'text-sm'}`}>
                            {player.displayName}
                            {isCurrentPlayer && <span className="ml-2 text-xs text-blue-200">(You)</span>}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-white font-bold ${isCurrentPlayer ? 'text-base' : 'text-sm'}`}>
                            {score} <span className="text-gray-400 font-normal">pts</span>
                          </span>
                          {hasSubmitted && isInputPhase && (
                            <span className="text-green-400 text-lg font-bold animate-pulse">✓</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
          
          {/* Step 4: Eliminated Message */}
          {isEliminated && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: '2px solid rgba(239, 68, 68, 0.5)',
              borderRadius: '1rem',
              padding: '0.75rem',
              marginBottom: '0.75rem',
              textAlign: 'center',
              width: '100%'
            }}>
              <div style={{ fontSize: '1.875rem', marginBottom: '0.25rem' }}>💀</div>
              <div style={{ color: 'white', fontSize: '1rem', fontWeight: 'bold' }}>
                Eliminated!
              </div>
            </div>
          )}
          
          <CircularSimonBoard
            sequence={currentSequence}
            round={currentRound}
            isShowingSequence={isShowingSequence}
            isInputPhase={isInputPhase}
            playerSequence={playerSequence}
            canSubmit={canSubmit}
            lastResult={lastResult}
            onColorClick={(color) => addColorToSequence(color, gameCode, playerId)}
            disabled={isEliminated}
            secondsRemaining={secondsRemaining}
            timerColor={timerColor}
            isTimerPulsing={isTimerPulsing}
          />
          
          {/* Message Display */}
          {message && (
            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                borderRadius: '0.75rem',
                padding: '1rem 1.5rem',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                display: 'inline-block'
              }}>
                <p style={{ color: 'white', fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>{message}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // Render countdown
  if (roomStatus === 'countdown' && countdownValue !== null) {
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
        
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 10 }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            borderRadius: '50%',
            width: '12rem',
            height: '12rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.5rem',
            marginLeft: 'auto',
            marginRight: 'auto',
            border: '4px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            animation: 'pulse 1s ease-in-out infinite'
          }}>
            <h1 style={{
              fontSize: 'clamp(4rem, 15vw, 6rem)',
              fontWeight: 900,
              color: 'white',
              margin: 0
            }}>
              {countdownValue}
            </h1>
          </div>
          <p style={{
            fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
            color: 'white',
            fontWeight: 600,
            animation: 'bounce 1s ease-in-out infinite',
            margin: 0
          }}>
            Get ready! 🎮
          </p>
        </div>
      </div>
    );
  }
  
  // Render waiting room
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
      
      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        borderRadius: '1.5rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        padding: '1.5rem 2rem',
        maxWidth: '42rem',
        width: '100%',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{
            fontSize: 'clamp(1.875rem, 5vw, 2.25rem)',
            fontWeight: 700,
            background: 'linear-gradient(to right, #ffffff, #e9d5ff, #fce7f3)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '0.5rem'
          }}>
            Waiting Room
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem' }}>Waiting for players to join...</p>
        </div>
        
        {/* Game Code Display with Share Buttons */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            borderRadius: '1rem',
            padding: '1.5rem',
            marginBottom: '1rem',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}>
            <p style={{
              textAlign: 'center',
              color: 'rgba(255, 255, 255, 0.9)',
              marginBottom: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: 500
            }}>
              Share this code with friends:
            </p>
            <div style={{ textAlign: 'center' }}>
              <span style={{
                fontFamily: 'monospace',
                fontWeight: 700,
                fontSize: 'clamp(1.875rem, 6vw, 2.25rem)',
                color: '#ffffff',
                letterSpacing: '0.1em',
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.75rem',
                display: 'inline-block',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}>
                {gameCode}
              </span>
            </div>
          </div>
          
          {/* Invite Buttons */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            justifyContent: 'center'
          }}>
            <button
              onClick={copyGameCode}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontWeight: 600,
                padding: '0.75rem 1.25rem',
                borderRadius: '0.75rem',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontSize: '1rem',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                minHeight: '48px',
                touchAction: 'manipulation',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              title="Copy game code"
            >
              📋 <span className="hidden sm:inline">Copy Code</span><span className="sm:hidden">Code</span>
            </button>
            
            <button
              onClick={copyInviteLink}
              style={{
                background: 'linear-gradient(to right, #2563eb, #3b82f6, #06b6d4)',
                color: 'white',
                fontWeight: 600,
                padding: '0.75rem 1.25rem',
                borderRadius: '0.75rem',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontSize: '1rem',
                border: 'none',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                minHeight: '48px',
                touchAction: 'manipulation',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
              }}
              title="Copy invite link"
            >
              🔗 <span className="hidden sm:inline">Copy Link</span><span className="sm:hidden">Link</span>
            </button>
            
            <button
              onClick={shareGame}
              style={{
                background: 'linear-gradient(to right, #9333ea, #a855f7, #ec4899)',
                color: 'white',
                fontWeight: 600,
                padding: '0.75rem 1.25rem',
                borderRadius: '0.75rem',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontSize: '1rem',
                border: 'none',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                minHeight: '48px',
                touchAction: 'manipulation',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
              }}
              title="Share with friends"
            >
              📤 <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>
        
        {/* Players List */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{
            fontSize: 'clamp(1.125rem, 3vw, 1.25rem)',
            fontWeight: 700,
            color: 'rgba(255, 255, 255, 0.9)',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span>👥</span>
            <span>Players ({players.length}/4)</span>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {players.map(player => {
              const isCurrentPlayer = player.id === playerId;
              return (
                <div 
                  key={player.id}
                  style={{
                    borderRadius: '0.75rem',
                    padding: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s',
                    background: isCurrentPlayer 
                      ? 'linear-gradient(to right, rgba(37, 99, 235, 0.3), rgba(147, 51, 234, 0.3))' 
                      : 'rgba(255, 255, 255, 0.1)',
                    border: isCurrentPlayer 
                      ? '2px solid rgba(59, 130, 246, 0.5)' 
                      : '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: isCurrentPlayer ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{player.avatar || '😀'}</span>
                    <span style={{
                      fontWeight: 600,
                      color: isCurrentPlayer ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.8)'
                    }}>
                      {player.displayName}
                      {isCurrentPlayer && <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 400 }}>(You)</span>}
                    </span>
                  </div>
                  {player.isHost && (
                    <span style={{
                      background: 'rgba(234, 179, 8, 0.2)',
                      color: 'rgba(234, 179, 8, 1)',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      👑 Host
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Start Button (host only, or solo player) */}
        {(isHost || players.length === 1) && (
          <>
            {players.length === 1 && (
              <p style={{
                textAlign: 'center',
                fontSize: '0.875rem',
                color: 'rgba(255, 255, 255, 0.8)',
                marginBottom: '1rem',
                background: 'rgba(59, 130, 246, 0.2)',
                borderRadius: '0.5rem',
                padding: '0.75rem',
                border: '1px solid rgba(59, 130, 246, 0.3)'
              }}>
                💡 You can start solo or wait for others to join
              </p>
            )}
            <button
              onClick={handleStartGame}
              style={{
                width: '100%',
                background: 'linear-gradient(to right, #9333ea, #a855f7, #ec4899)',
                color: 'white',
                fontWeight: 700,
                padding: '1rem 1.5rem',
                borderRadius: '0.75rem',
                border: 'none',
                boxShadow: '0 10px 15px -3px rgba(147, 51, 234, 0.5)',
                transition: 'all 0.2s',
                fontSize: '1.125rem',
                minHeight: '56px',
                touchAction: 'manipulation',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(147, 51, 234, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(147, 51, 234, 0.5)';
              }}
            >
              🎮 {players.length === 1 ? 'Start Solo Game' : 'Start Game'}
            </button>
          </>
        )}
        
        {!isHost && players.length > 1 && (
          <p style={{
            textAlign: 'center',
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: 'clamp(0.875rem, 2vw, 1rem)'
          }}>
            Waiting for host to start the game...
          </p>
        )}
      </div>
    </div>
  );
}
