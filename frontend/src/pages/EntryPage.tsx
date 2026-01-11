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
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-blue-600 flex items-center justify-center p-4 sm:p-6">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 sm:p-10 max-w-md w-full border border-white/20">
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-3">
              🎮 Simon Says
            </h1>
            <p className="text-gray-600 text-base sm:text-lg font-medium">Color Race Edition</p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={() => setMode('create')}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 text-lg min-h-[56px]"
              style={{ touchAction: 'manipulation' }}
            >
              Create Game
            </button>
            
            <button
              onClick={() => setMode('join')}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 text-lg min-h-[56px]"
              style={{ touchAction: 'manipulation' }}
            >
              Join Game
            </button>
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
              {['1', '2', '3', '4', '5', '6', '7', '8'].map((id) => (
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
                  <span className="text-3xl">{['😀', '🎮', '🚀', '⚡', '🎨', '🎯', '🏆', '🌟'][parseInt(id) - 1]}</span>
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
