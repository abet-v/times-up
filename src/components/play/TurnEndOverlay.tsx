import { motion } from 'framer-motion';
import { Eye, Check } from 'lucide-react';
import { Button } from '../ui';
import type { Turn } from '../../types/game';
import { getTeamName } from '../../lib/utils';

interface TurnEndOverlayProps {
  lastTurn: Turn;
  nextPlayerName?: string;
  onComplete: () => void;
  canReview: boolean;
  onOpenReview: () => void;
}

const teamColors = {
  A: {
    bg: 'rgba(45, 93, 161, 0.15)',
    text: '#2d5da1',
    accent: '#e8f0fe'
  },
  B: {
    bg: 'rgba(217, 119, 6, 0.15)',
    text: '#d97706',
    accent: '#fef3c7'
  }
};

export function TurnEndOverlay({
  lastTurn,
  nextPlayerName,
  onComplete,
  canReview,
  onOpenReview
}: TurnEndOverlayProps) {
  const team = lastTurn.teamId;
  const pointsScored = lastTurn.correctCount;
  const colors = teamColors[team];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4"
      style={{ backgroundColor: colors.bg }}
    >
      {/* Paper texture */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'radial-gradient(#e5e0d8 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      <div className="relative z-10 flex flex-col items-center max-w-sm w-full">
        {/* Points display */}
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{
            scale: [0, 1.3, 1],
            rotate: [-10, 5, 0],
            transition: { duration: 0.5 }
          }}
          className="flex flex-col items-center mb-8"
        >
          <motion.span
            className="font-sketch font-bold"
            style={{
              fontSize: '120px',
              color: colors.text,
              textShadow: '6px 6px 0 rgba(45, 45, 45, 0.15)'
            }}
            animate={{
              scale: [1, 1.05, 1],
              transition: { repeat: 2, duration: 0.2 }
            }}
          >
            +{pointsScored}
          </motion.span>
          <span
            className="font-hand text-2xl mt-2"
            style={{ color: colors.text }}
          >
            {pointsScored === 0 ? 'Aucun point' : pointsScored === 1 ? 'point' : 'points'}
          </span>
        </motion.div>

        {/* Next player info */}
        {nextPlayerName && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center text-center mb-8"
          >
            <span className="font-hand text-base text-[#2d2d2d]/70 mb-1">
              Prochain tour
            </span>
            <span
              className="font-sketch font-bold text-2xl"
              style={{ color: teamColors[team === 'A' ? 'B' : 'A'].text }}
            >
              {nextPlayerName}
            </span>
            <span
              className="font-hand text-sm"
              style={{ color: teamColors[team === 'A' ? 'B' : 'A'].text }}
            >
              {getTeamName(team === 'A' ? 'B' : 'A')}
            </span>
          </motion.div>
        )}

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full space-y-3"
        >
          {canReview && (
            <Button
              fullWidth
              variant="secondary"
              onClick={onOpenReview}
              icon={<Eye className="w-5 h-5" />}
            >
              Revoir le tour
            </Button>
          )}
          <Button
            fullWidth
            size="lg"
            onClick={onComplete}
            icon={<Check className="w-6 h-6" />}
          >
            Ok !
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
