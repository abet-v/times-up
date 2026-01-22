import { v4 as uuidv4 } from 'uuid';

export const generateId = (): string => uuidv4();

export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const getPhaseTitle = (phase: number): string => {
  switch (phase) {
    case 1:
      return 'Description libre';
    case 2:
      return 'Un seul mot';
    case 3:
      return 'Mime';
    default:
      return '';
  }
};

export const getPhaseDescription = (phase: number): string => {
  switch (phase) {
    case 1:
      return 'Décris le mot sans le dire !';
    case 2:
      return 'Un seul mot pour faire deviner !';
    case 3:
      return 'Mime le mot, pas de paroles !';
    default:
      return '';
  }
};

export const getTeamColor = (team: 'A' | 'B'): string => {
  return team === 'A' ? '#3b82f6' : '#eab308';
};

export const getTeamName = (team: 'A' | 'B'): string => {
  return team === 'A' ? 'Équipe Bleue' : 'Équipe Jaune';
};

// Avatar colors for players
export const avatarColors = [
  '#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#8b5cf6',
  '#6366f1', '#3b82f6', '#0ea5e9', '#14b8a6', '#22c55e',
  '#84cc16', '#eab308', '#f97316', '#ef4444'
];

export const getAvatarColor = (index: number): string => {
  return avatarColors[index % avatarColors.length];
};

