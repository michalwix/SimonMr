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
    submitSequence,
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-2 sm:p-4">
        {/* Mute Button */}
        <MuteButton />
        
        <div className="flex flex-col items-center w-full max-w-md">
          {/* Step 4: Scoreboard */}
          {isGameActive && Object.keys(scores).length > 0 && (
            <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl p-4 mb-4 w-full border border-gray-700/50 shadow-xl">
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
                        className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                          isCurrentPlayer 
                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg scale-105 border-2 border-blue-400' 
                            : 'bg-gray-700/80 border border-gray-600/50'
                        }`}
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
            <div className="bg-red-500/20 border-2 border-red-500 rounded-xl sm:rounded-2xl p-3 mb-3 text-center w-full">
              <div className="text-3xl mb-1">💀</div>
              <div className="text-white text-base sm:text-lg font-bold">
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
            onColorClick={addColorToSequence}
            onSubmit={() => {
              if (gameCode && playerId) {
                submitSequence(gameCode, playerId);
              }
            }}
            disabled={isEliminated}
            secondsRemaining={secondsRemaining}
            timerColor={timerColor}
            isTimerPulsing={isTimerPulsing}
          />
          
          {/* Message Display */}
          {message && (
            <div className="mt-6 text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 border border-white/20 inline-block">
                <p className="text-white text-lg font-semibold">{message}</p>
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
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-blue-600 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-full w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center mb-6 mx-auto border-4 border-white/20 shadow-2xl">
            <h1 className="text-7xl sm:text-8xl md:text-9xl font-bold text-white animate-pulse">
              {countdownValue}
            </h1>
          </div>
          <p className="text-2xl sm:text-3xl md:text-4xl text-white font-semibold animate-bounce">
            Get ready! 🎮
          </p>
        </div>
      </div>
    );
  }
  
  // Render waiting room
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-blue-600 flex items-center justify-center p-4 sm:p-6">
      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 max-w-md sm:max-w-xl md:max-w-2xl w-full border border-white/20">
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Waiting Room
          </h1>
          <p className="text-gray-600 text-sm">Waiting for players to join...</p>
        </div>
        
        {/* Game Code Display with Share Buttons */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 mb-4 border-2 border-purple-200">
            <p className="text-center text-gray-700 mb-2 text-sm font-medium">
              Share this code with friends:
            </p>
            <div className="text-center">
              <span className="font-mono font-bold text-3xl sm:text-4xl text-purple-600 tracking-wider bg-white px-6 py-3 rounded-xl inline-block border-2 border-purple-300 shadow-md">
                {gameCode}
              </span>
            </div>
          </div>
          
          {/* Invite Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={copyGameCode}
              className="bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 font-semibold py-3 px-5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-base shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 min-h-[48px]"
              style={{ touchAction: 'manipulation' }}
              title="Copy game code"
            >
              📋 <span className="hidden sm:inline">Copy Code</span><span className="sm:hidden">Code</span>
            </button>
            
            <button
              onClick={copyInviteLink}
              className="bg-blue-100 hover:bg-blue-200 active:bg-blue-300 text-blue-700 font-semibold py-3 px-5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-base shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 min-h-[48px]"
              style={{ touchAction: 'manipulation' }}
              title="Copy invite link"
            >
              🔗 <span className="hidden sm:inline">Copy Link</span><span className="sm:hidden">Link</span>
            </button>
            
            <button
              onClick={shareGame}
              className="bg-green-100 hover:bg-green-200 active:bg-green-300 text-green-700 font-semibold py-3 px-5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-base shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 min-h-[48px]"
              style={{ touchAction: 'manipulation' }}
              title="Share with friends"
            >
              📤 <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>
        
        {/* Players List */}
        <div className="mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>👥</span>
            <span>Players ({players.length}/4)</span>
          </h2>
          <div className="space-y-3">
            {players.map(player => {
              const isCurrentPlayer = player.id === playerId;
              return (
                <div 
                  key={player.id} 
                  className={`rounded-xl p-4 flex items-center justify-between transition-all duration-200 ${
                    isCurrentPlayer 
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300 shadow-md' 
                      : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{player.avatar || '😀'}</span>
                    <span className={`font-semibold ${isCurrentPlayer ? 'text-blue-700' : 'text-gray-700'}`}>
                      {player.displayName}
                      {isCurrentPlayer && <span className="ml-2 text-xs text-blue-500 font-normal">(You)</span>}
                    </span>
                  </div>
                  {player.isHost && (
                    <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
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
              <p className="text-center text-sm text-gray-500 mb-4 bg-blue-50 rounded-lg p-3 border border-blue-200">
                💡 You can start solo or wait for others to join
              </p>
            )}
            <button
              onClick={handleStartGame}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 text-lg min-h-[56px]"
              style={{ touchAction: 'manipulation' }}
            >
              🎮 {players.length === 1 ? 'Start Solo Game' : 'Start Game'}
            </button>
          </>
        )}
        
        {!isHost && players.length > 1 && (
          <p className="text-center text-gray-500 text-sm sm:text-base">
            Waiting for host to start the game...
          </p>
        )}
      </div>
    </div>
  );
}
