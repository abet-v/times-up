import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameSession, Player, Team, GamePhase, GameStatus, GameSettings, PhaseScore } from '../types/game';
import { generateId, shuffleArray } from '../lib/utils';

interface GameStore {
  session: GameSession | null;
  currentPlayerId: string | null; // Track which player is currently entering words

  // Multiplayer P2P state
  isMultiplayerHost: boolean;
  hostPeerId: string | null;

  // Session actions
  createSession: (hostName: string, settings?: Partial<GameSettings>) => void;
  leaveSession: () => void;
  updateSettings: (settings: Partial<GameSettings>) => void;

  // Player actions
  addPlayer: (name: string) => Player;
  removePlayer: (playerId: string) => void;
  setCurrentPlayer: (playerId: string | null) => void;

  // Word actions
  addWord: (playerId: string, word: string) => void;
  removeWord: (playerId: string, word: string) => void;
  finalizePlayerWords: (playerId: string) => void;

  // Team actions
  assignTeam: (playerId: string, team: Team) => void;
  randomizeTeams: () => void;

  // Game flow actions
  setStatus: (status: GameStatus) => void;
  goToTeams: () => void;
  startGame: () => void;
  startTurn: () => void;
  markCorrect: () => string | null;
  skipWord: () => string | null;
  endTurn: () => void;
  nextPhase: () => void;
  endGame: () => void;
  resetGame: () => void;

  // Multiplayer P2P actions
  enableMultiplayer: (peerId: string) => void;
  disableMultiplayer: () => void;
  addRemotePlayer: (name: string, peerId: string) => Player;
  updateRemotePlayerWords: (peerId: string, words: string[]) => void;
  finalizeRemotePlayerWords: (peerId: string, words: string[]) => void;
  removeRemotePlayer: (peerId: string) => void;

  // Helpers
  getActivePlayer: () => Player | null;
  getNextPlayer: () => Player | null;
  getCurrentWord: () => string | null;
  getTeamPlayers: (team: Team) => Player[];
  getPlayer: (playerId: string) => Player | null;
  getRemotePlayer: (peerId: string) => Player | null;
}

const defaultSettings: GameSettings = {
  wordsPerPlayer: 5,
  roundDuration: 60
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      session: null,
      currentPlayerId: null,
      isMultiplayerHost: false,
      hostPeerId: null,

      createSession: (hostName, settings = {}) => {
        const hostPlayer: Player = {
          id: generateId(),
          name: hostName,
          words: [],
          isHost: true,
          wordsCompleted: false
        };

        const session: GameSession = {
          id: generateId(),
          hostId: hostPlayer.id,
          status: 'words', // Start directly with word entry
          phase: 0,
          currentTeam: 'A',
          settings: { ...defaultSettings, ...settings },
          players: [hostPlayer],
          wordPool: [],
          remainingWords: [],
          guessedWords: [],
          scores: [],
          teamAPlayerIndex: 0,
          teamBPlayerIndex: 0,
          teamAScore: 0,
          teamBScore: 0,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };

        set({ session, currentPlayerId: hostPlayer.id });
      },

      leaveSession: () => set({ session: null, currentPlayerId: null, isMultiplayerHost: false, hostPeerId: null }),

      updateSettings: (settings) => {
        const { session } = get();
        if (!session) return;

        set({
          session: {
            ...session,
            settings: { ...session.settings, ...settings },
            updatedAt: Date.now()
          }
        });
      },

      setCurrentPlayer: (playerId) => set({ currentPlayerId: playerId }),

      addPlayer: (name) => {
        const { session } = get();
        if (!session) throw new Error('No session');

        const newPlayer: Player = {
          id: generateId(),
          name,
          words: [],
          isHost: false,
          wordsCompleted: false
        };

        set({
          session: {
            ...session,
            players: [...session.players, newPlayer],
            updatedAt: Date.now()
          },
          currentPlayerId: newPlayer.id
        });

        return newPlayer;
      },

      removePlayer: (playerId) => {
        const { session } = get();
        if (!session) return;

        set({
          session: {
            ...session,
            players: session.players.filter(p => p.id !== playerId),
            updatedAt: Date.now()
          }
        });
      },

      addWord: (playerId, word) => {
        const { session } = get();
        if (!session) return;

        set({
          session: {
            ...session,
            players: session.players.map(p =>
              p.id === playerId
                ? { ...p, words: [...p.words, word.trim()] }
                : p
            ),
            updatedAt: Date.now()
          }
        });
      },

      removeWord: (playerId, word) => {
        const { session } = get();
        if (!session) return;

        set({
          session: {
            ...session,
            players: session.players.map(p =>
              p.id === playerId
                ? { ...p, words: p.words.filter(w => w !== word) }
                : p
            ),
            updatedAt: Date.now()
          }
        });
      },

      finalizePlayerWords: (playerId) => {
        const { session } = get();
        if (!session) return;

        set({
          session: {
            ...session,
            players: session.players.map(p =>
              p.id === playerId ? { ...p, wordsCompleted: true } : p
            ),
            updatedAt: Date.now()
          },
          currentPlayerId: null
        });
      },

      goToTeams: () => {
        const { session } = get();
        if (!session) return;

        // Collect all words into the pool
        const allWords = session.players.flatMap(p => p.words);
        const shuffledWords = shuffleArray(allWords);

        set({
          session: {
            ...session,
            wordPool: shuffledWords,
            remainingWords: [...shuffledWords],
            status: 'teams',
            updatedAt: Date.now()
          }
        });
      },

      assignTeam: (playerId, team) => {
        const { session } = get();
        if (!session) return;

        set({
          session: {
            ...session,
            players: session.players.map(p =>
              p.id === playerId ? { ...p, team } : p
            ),
            updatedAt: Date.now()
          }
        });
      },

      randomizeTeams: () => {
        const { session } = get();
        if (!session) return;

        const shuffledPlayers = shuffleArray([...session.players]);
        const half = Math.ceil(shuffledPlayers.length / 2);

        const updatedPlayers = shuffledPlayers.map((p, i) => ({
          ...p,
          team: (i < half ? 'A' : 'B') as Team
        }));

        set({
          session: {
            ...session,
            players: updatedPlayers,
            updatedAt: Date.now()
          }
        });
      },

      setStatus: (status) => {
        const { session } = get();
        if (!session) return;

        set({
          session: {
            ...session,
            status,
            updatedAt: Date.now()
          }
        });
      },

      startGame: () => {
        const { session } = get();
        if (!session) return;

        const shuffledWords = shuffleArray([...session.wordPool]);

        set({
          session: {
            ...session,
            status: 'playing',
            phase: 1,
            currentTeam: 'A',
            remainingWords: shuffledWords,
            guessedWords: [],
            teamAPlayerIndex: 0,
            teamBPlayerIndex: 0,
            scores: [],
            updatedAt: Date.now()
          }
        });
      },

      startTurn: () => {
        const { session } = get();
        if (!session) return;

        const teamPlayers = get().getTeamPlayers(session.currentTeam);
        const playerIndex = session.currentTeam === 'A'
          ? session.teamAPlayerIndex
          : session.teamBPlayerIndex;
        const activePlayer = teamPlayers[playerIndex % teamPlayers.length];

        set({
          session: {
            ...session,
            currentTurn: {
              teamId: session.currentTeam,
              activePlayerId: activePlayer?.id || '',
              startTime: Date.now(),
              correctCount: 0,
              skippedWords: []
            },
            updatedAt: Date.now()
          }
        });
      },

      markCorrect: () => {
        const { session } = get();
        if (!session || !session.currentTurn || session.remainingWords.length === 0) return null;

        const [currentWord, ...rest] = session.remainingWords;
        const isTeamA = session.currentTeam === 'A';

        set({
          session: {
            ...session,
            remainingWords: rest,
            guessedWords: [...session.guessedWords, currentWord],
            teamAScore: isTeamA ? session.teamAScore + 1 : session.teamAScore,
            teamBScore: isTeamA ? session.teamBScore : session.teamBScore + 1,
            currentTurn: {
              ...session.currentTurn,
              correctCount: session.currentTurn.correctCount + 1
            },
            updatedAt: Date.now()
          }
        });

        return rest.length > 0 ? rest[0] : null;
      },

      skipWord: () => {
        const { session } = get();
        if (!session || !session.currentTurn || session.remainingWords.length === 0) return null;

        const [currentWord, ...rest] = session.remainingWords;
        const newRemaining = [...rest, currentWord];

        set({
          session: {
            ...session,
            remainingWords: newRemaining,
            currentTurn: {
              ...session.currentTurn,
              skippedWords: [...session.currentTurn.skippedWords, currentWord]
            },
            updatedAt: Date.now()
          }
        });

        return newRemaining[0];
      },

      endTurn: () => {
        const { session } = get();
        if (!session || !session.currentTurn) return;

        const nextTeam: Team = session.currentTeam === 'A' ? 'B' : 'A';
        const newPlayerIndex = session.currentTeam === 'A'
          ? { teamAPlayerIndex: session.teamAPlayerIndex + 1, teamBPlayerIndex: session.teamBPlayerIndex }
          : { teamAPlayerIndex: session.teamAPlayerIndex, teamBPlayerIndex: session.teamBPlayerIndex + 1 };

        set({
          session: {
            ...session,
            currentTeam: nextTeam,
            ...newPlayerIndex,
            currentTurn: undefined,
            updatedAt: Date.now()
          }
        });
      },

      nextPhase: () => {
        const { session } = get();
        if (!session) return;

        // Use actual team scores instead of alternating index calculation
        const currentScore: PhaseScore = {
          phase: session.phase,
          teamA: session.teamAScore,
          teamB: session.teamBScore
        };

        const nextPhase = (session.phase + 1) as GamePhase;
        const shuffledWords = shuffleArray([...session.wordPool]);

        if (nextPhase > 3) {
          set({
            session: {
              ...session,
              status: 'game-over',
              scores: [...session.scores, currentScore],
              updatedAt: Date.now()
            }
          });
        } else {
          set({
            session: {
              ...session,
              phase: nextPhase,
              status: 'phase-summary',
              remainingWords: shuffledWords,
              guessedWords: [],
              currentTeam: 'A',
              teamAPlayerIndex: 0,
              teamBPlayerIndex: 0,
              // Reset team scores for the new phase
              teamAScore: 0,
              teamBScore: 0,
              scores: [...session.scores, currentScore],
              currentTurn: undefined,
              updatedAt: Date.now()
            }
          });
        }
      },

      endGame: () => {
        set({ session: null, currentPlayerId: null, isMultiplayerHost: false, hostPeerId: null });
      },

      resetGame: () => {
        set({ session: null, currentPlayerId: null, isMultiplayerHost: false, hostPeerId: null });
      },

      getActivePlayer: () => {
        const { session } = get();
        if (!session) return null;

        // If there's a current turn, return the active player from the turn
        if (session.currentTurn) {
          return session.players.find(p => p.id === session.currentTurn?.activePlayerId) || null;
        }

        // Otherwise, calculate who WOULD be the active player based on current team and index
        const teamPlayers = get().getTeamPlayers(session.currentTeam);
        if (teamPlayers.length === 0) return null;

        const playerIndex = session.currentTeam === 'A'
          ? session.teamAPlayerIndex
          : session.teamBPlayerIndex;

        return teamPlayers[playerIndex % teamPlayers.length] || null;
      },

      getNextPlayer: () => {
        const { session } = get();
        if (!session) return null;

        // Next team is opposite of current
        const nextTeam: Team = session.currentTeam === 'A' ? 'B' : 'A';
        const teamPlayers = get().getTeamPlayers(nextTeam);
        if (teamPlayers.length === 0) return null;

        const nextPlayerIndex = nextTeam === 'A'
          ? session.teamAPlayerIndex
          : session.teamBPlayerIndex;

        return teamPlayers[nextPlayerIndex % teamPlayers.length] || null;
      },

      getCurrentWord: () => {
        const { session } = get();
        if (!session || session.remainingWords.length === 0) return null;
        return session.remainingWords[0];
      },

      getTeamPlayers: (team) => {
        const { session } = get();
        if (!session) return [];
        return session.players.filter(p => p.team === team);
      },

      getPlayer: (playerId) => {
        const { session } = get();
        if (!session) return null;
        return session.players.find(p => p.id === playerId) || null;
      },

      getRemotePlayer: (peerId) => {
        const { session } = get();
        if (!session) return null;
        return session.players.find(p => p.peerId === peerId) || null;
      },

      // Multiplayer P2P actions
      enableMultiplayer: (peerId) => {
        set({ isMultiplayerHost: true, hostPeerId: peerId });
      },

      disableMultiplayer: () => {
        set({ isMultiplayerHost: false, hostPeerId: null });
      },

      addRemotePlayer: (name, peerId) => {
        const { session } = get();
        if (!session) throw new Error('No session');

        const newPlayer: Player = {
          id: generateId(),
          name,
          words: [],
          isHost: false,
          wordsCompleted: false,
          isRemote: true,
          peerId
        };

        set({
          session: {
            ...session,
            players: [...session.players, newPlayer],
            updatedAt: Date.now()
          }
        });

        return newPlayer;
      },

      updateRemotePlayerWords: (peerId, words) => {
        const { session } = get();
        if (!session) return;

        set({
          session: {
            ...session,
            players: session.players.map(p =>
              p.peerId === peerId ? { ...p, words } : p
            ),
            updatedAt: Date.now()
          }
        });
      },

      finalizeRemotePlayerWords: (peerId, words) => {
        const { session } = get();
        if (!session) return;

        set({
          session: {
            ...session,
            players: session.players.map(p =>
              p.peerId === peerId
                ? { ...p, words, wordsCompleted: true }
                : p
            ),
            updatedAt: Date.now()
          }
        });
      },

      removeRemotePlayer: (peerId) => {
        const { session } = get();
        if (!session) return;

        set({
          session: {
            ...session,
            players: session.players.filter(p => p.peerId !== peerId),
            updatedAt: Date.now()
          }
        });
      }
    }),
    {
      name: 'timesup-game-storage',
      partialize: (state) => ({
        session: state.session,
        currentPlayerId: state.currentPlayerId,
        isMultiplayerHost: state.isMultiplayerHost,
        hostPeerId: state.hostPeerId
      })
    }
  )
);

