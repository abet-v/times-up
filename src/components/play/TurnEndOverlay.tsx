import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Team } from '../../types/game';
import { getTeamName } from '../../lib/utils';

interface TurnEndOverlayProps {
  pointsScored: number;
  team: Team;
  nextPlayerName?: string;
  onComplete: () => void;
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

export function TurnEndOverlay({ pointsScored, team, nextPlayerName, onComplete }: TurnEndOverlayProps) {
  const [phase, setPhase] = useState<'points' | 'fly' | 'next'>('points');
  const colors = teamColors[team];

  useEffect(() => {
    // Phase 1: Show points (800ms)
    const timer1 = setTimeout(() => setPhase('fly'), 800);

    // Phase 2: Fly animation (800ms)
    const timer2 = setTimeout(() => setPhase('next'), 1600);

    // Phase 3: Show next player, then complete (1000ms)
    const timer3 = setTimeout(() => onComplete(), 2500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
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

      <AnimatePresence mode="wait">
        {(phase === 'points' || phase === 'fly') && (
          <motion.div
            key="points"
            initial={{ scale: 0, rotate: -10 }}
            animate={phase === 'fly' ? {
              scale: 0.3,
              y: -200,
              opacity: 0,
              transition: { duration: 0.6, ease: 'easeIn' }
            } : {
              scale: [0, 1.3, 1],
              rotate: [-10, 5, 0],
              transition: { duration: 0.5 }
            }}
            className="flex flex-col items-center"
          >
            <motion.span
              className="font-sketch font-bold"
              style={{
                fontSize: '140px',
                color: colors.text,
                textShadow: '6px 6px 0 rgba(45, 45, 45, 0.15)'
              }}
              animate={phase === 'points' ? {
                scale: [1, 1.05, 1],
                transition: { repeat: 2, duration: 0.2 }
              } : {}}
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
        )}

        {phase === 'next' && nextPlayerName && (
          <motion.div
            key="next"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center text-center"
          >
            <span className="font-hand text-xl text-[#2d2d2d]/70 mb-2">
              Prochain tour
            </span>
            <span
              className="font-sketch font-bold text-4xl"
              style={{ color: colors.text }}
            >
              {nextPlayerName}
            </span>
            <span
              className="font-hand text-lg mt-1"
              style={{ color: colors.text }}
            >
              {getTeamName(team === 'A' ? 'B' : 'A')}
            </span>
          </motion.div>
        )}

        {phase === 'next' && !nextPlayerName && (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center text-center"
          >
            <span
              className="font-sketch font-bold text-3xl"
              style={{ color: colors.text }}
            >
              Tour terminé !
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
