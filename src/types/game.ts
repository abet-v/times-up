export type GamePhase = 0 | 1 | 2 | 3; // 0 = setup, 1-3 = game phases
export type Team = 'A' | 'B';
export type GameStatus = 'words' | 'teams' | 'playing' | 'phase-summary' | 'game-over';

export interface Player {
  id: string;
  name: string;
  avatar?: string;
  team?: Team;
  words: string[];
  isHost: boolean;
  wordsCompleted: boolean;
  isRemote?: boolean; // True if player joined via P2P
  peerId?: string; // PeerJS connection ID for remote players
}

export type TimePenalty = 0 | 3 | 5;

export interface PhasePassSettings {
  enabled: boolean;
  timePenalty: TimePenalty;
}

export type PhaseSettingsMap = {
  [K in 1 | 2 | 3]: PhasePassSettings;
};

export interface GameSettings {
  wordsPerPlayer: number;
  roundDuration: number; // seconds
  phaseSettings: PhaseSettingsMap;
}

export interface Turn {
  teamId: Team;
  activePlayerId: string;
  startTime: number;
  correctCount: number;
  skippedWords: string[];
  accumulatedPenalty: number;
}

export interface PhaseScore {
  phase: GamePhase;
  teamA: number;
  teamB: number;
}

export interface GameSession {
  id: string;
  hostId: string;
  status: GameStatus;
  phase: GamePhase;
  currentTeam: Team;
  settings: GameSettings;
  players: Player[];
  wordPool: string[];
  remainingWords: string[];
  guessedWords: string[];
  currentTurn?: Turn;
  scores: PhaseScore[];
  teamAPlayerIndex: number;
  teamBPlayerIndex: number;
  teamAScore: number;
  teamBScore: number;
  createdAt: number;
  updatedAt: number;
}

