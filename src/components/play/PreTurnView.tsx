import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { Button, Card, Avatar } from '../ui';
import type { GameSession, Player } from '../../types/game';
import { getPhaseTitle, getPhaseDescription, getTeamName } from '../../lib/utils';

interface PreTurnViewProps {
  session: GameSession;
  activePlayer: Player | null;
  playerIndex: number;
  onStart: () => void;
}

export function PreTurnView({ session, activePlayer, playerIndex, onStart }: PreTurnViewProps) {
  // Easter egg: Greg sound when it's Greg's turn
  useEffect(() => {
    const nameLower = activePlayer?.name.toLowerCase();
    if (nameLower === 'greg' || nameLower === 'gregoire' || nameLower === 'grégoire') {
      const audio = new Audio('https://www.myinstants.com/media/sounds/ouais-cest-greg.mp3');
      audio.play().catch(() => {});
    }
  }, [activePlayer]);
  const isTeamA = session.currentTeam === 'A';
  const remainingCount = session.remainingWords.length;

  return (
    <div className="h-[100dvh] p-4 flex flex-col overflow-hidden">
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col pt-10 min-h-0">
        {/* Phase Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-4 flex-shrink-0"
        >
          <div
            className={`
              inline-block px-4 py-2 rounded-xl text-base font-bold font-sketch mb-2
              border-[3px] shadow-[4px_4px_0_rgba(45,45,45,0.15)]
              ${isTeamA
                ? 'bg-blue-50 text-blue-700 border-blue-400'
                : 'bg-amber-50 text-amber-700 border-amber-400'
              }
            `}
            style={{
              borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px'
            }}
          >
            Phase {session.phase} - {getPhaseTitle(session.phase)}
          </div>
          <p className="text-gray-500 text-sm font-hand">
            {getPhaseDescription(session.phase)}
          </p>
          <p className="text-gray-400 text-xs font-hand mt-1">
            {remainingCount} mot{remainingCount > 1 ? 's' : ''} restant{remainingCount > 1 ? 's' : ''}
          </p>
        </motion.div>

        {/* Scores */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-3 mb-4 flex-shrink-0"
        >
          <Card variant="team-a" className="p-3 text-center">
            <p className="text-xs text-blue-600 font-hand">{getTeamName('A')}</p>
            <p className="text-3xl font-bold font-sketch text-gray-800">
              {session.teamAScore}
            </p>
          </Card>
          <Card variant="team-b" className="p-3 text-center">
            <p className="text-xs text-amber-600 font-hand">{getTeamName('B')}</p>
            <p className="text-3xl font-bold font-sketch text-gray-800">
              {session.teamBScore}
            </p>
          </Card>
        </motion.div>

        {/* Active Player Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex-1 min-h-0 flex flex-col"
        >
          <Card
            variant={isTeamA ? 'team-a' : 'team-b'}
            className="p-4 text-center flex-1 flex flex-col justify-center"
          >
            <p className={`text-base mb-2 font-hand ${isTeamA ? 'text-blue-600' : 'text-amber-600'}`}>
              C'est au tour de...
            </p>
            {activePlayer && (
              <div className="flex flex-col items-center gap-2">
                <Avatar
                  name={activePlayer.name}
                  index={playerIndex}
                  size="md"
                />
                <span className="text-2xl font-bold font-sketch text-gray-800">
                  {activePlayer.name}
                </span>
                <span className={`text-sm font-hand ${isTeamA ? 'text-blue-600' : 'text-amber-600'}`}>
                  {getTeamName(session.currentTeam)}
                </span>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Start Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-4 pb-2 flex-shrink-0"
        >
          <Button
            fullWidth
            size="lg"
            onClick={onStart}
            icon={<Play className="w-6 h-6" />}
          >
            Commencer
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
